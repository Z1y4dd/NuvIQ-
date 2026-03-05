"use client";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Upload, KpiData, ForecastData, BundleData } from "./data";

function getDB() {
    if (!db) {
        throw new Error(
            "Firestore is not initialized. Make sure you are calling this from the client side.",
        );
    }
    return db;
}

// Firestore doesn't support nested arrays (string[][]).
// Serialize content to a JSON string before writing, deserialize after reading.
function serializeForFirestore(data: Partial<Upload>): any {
    if (data.content !== undefined) {
        return { ...data, content: JSON.stringify(data.content) };
    }
    return data;
}

function deserializeFromFirestore(data: any): any {
    if (data.content && typeof data.content === "string") {
        try {
            return { ...data, content: JSON.parse(data.content) };
        } catch {
            return data;
        }
    }
    return data;
}

export async function createDataset(
    userId: string,
    dataset: Omit<Upload, "id">,
): Promise<string> {
    const docRef = await addDoc(collection(getDB(), "datasets"), {
        ...serializeForFirestore(dataset),
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });

    return docRef.id;
}

export async function getUserDatasets(userId: string): Promise<Upload[]> {
    const q = query(
        collection(getDB(), "datasets"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
        (doc) =>
            deserializeFromFirestore({
                id: doc.id,
                ...doc.data(),
            }) as Upload,
    );
}

export async function getDataset(datasetId: string): Promise<Upload | null> {
    const docRef = doc(getDB(), "datasets", datasetId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return null;
    }

    return deserializeFromFirestore({
        id: docSnap.id,
        ...docSnap.data(),
    }) as Upload;
}

export async function updateDataset(
    datasetId: string,
    updates: Partial<Upload>,
): Promise<void> {
    const docRef = doc(getDB(), "datasets", datasetId);
    await updateDoc(docRef, {
        ...serializeForFirestore(updates),
        updatedAt: Timestamp.now(),
    });
}

export async function deleteDataset(datasetId: string): Promise<void> {
    const { deleteDoc } = await import("firebase/firestore");
    const docRef = doc(getDB(), "datasets", datasetId);
    await deleteDoc(docRef);
}

export async function saveForecast(
    datasetId: string,
    forecast: ForecastData[],
): Promise<void> {
    await updateDataset(datasetId, { forecast });
}

export async function saveKPIs(
    datasetId: string,
    kpis: KpiData[],
): Promise<void> {
    await updateDataset(datasetId, { kpis });
}

export async function saveBundles(
    datasetId: string,
    bundles: BundleData[],
): Promise<void> {
    await updateDataset(datasetId, { bundles });
}

export function subscribeToUserDatasets(
    userId: string,
    callback: (datasets: Upload[]) => void,
): () => void {
    const q = query(
        collection(getDB(), "datasets"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const datasets = snapshot.docs.map(
                (doc) =>
                    deserializeFromFirestore({
                        id: doc.id,
                        ...doc.data(),
                    }) as Upload,
            );
            callback(datasets);
        },
        (error) => {
            console.error("Firestore subscription error:", error.message);
            // Still invoke callback with empty list so the UI isn't stuck loading
            callback([]);
        },
    );
}
