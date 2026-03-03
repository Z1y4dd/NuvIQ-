"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import {
    getFirestore,
    connectFirestoreEmulator,
    type Firestore,
} from "firebase/firestore";
// Storage removed to avoid costs - CSV data stored in Firestore instead
// import {
//     getStorage,
//     connectStorageEmulator,
//     type FirebaseStorage,
// } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;
// Storage disabled to save costs
// let storage: FirebaseStorage | undefined = undefined;

// Only initialize on client side
if (typeof window !== "undefined") {
    // Initialize Firebase
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    // Storage disabled to save costs - using Firestore only
    // storage = getStorage(app);

    // Connect to emulators in development
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        const authHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
        const firestoreHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST;
        const storageHost =
            process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;

        if (authHost && auth) {
            try {
                connectAuthEmulator(auth, `http://${authHost}`, {
                    disableWarnings: true,
                });
            } catch (e) {
                // Emulator already connected
            }
        }

        if (firestoreHost && db) {
            try {
                const [host, port] = firestoreHost.split(":");
                connectFirestoreEmulator(db, host, parseInt(port));
            } catch (e) {
                // Emulator already connected
            }
        }
// Storage emulator disabled
        // if (storageHost && storage) {
        //     try {
        //         const [host, port] = storageHost.split(":");
        //         connectStorageEmulator(storage, host, parseInt(port));
        //     } catch (e) {
        //         // Emulator already connected
        //     }
        // }
    }
}

export { auth, db };
export default app;
