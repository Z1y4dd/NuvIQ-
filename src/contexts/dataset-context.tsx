"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";
import { useAuth } from "./auth-context";
import { subscribeToUserDatasets } from "@/lib/firestore";
import type { Upload } from "@/lib/data";

interface DatasetContextType {
    selectedDataset: Upload | null;
    setSelectedDataset: Dispatch<SetStateAction<Upload | null>>;
    uploads: Upload[];
    loading: boolean;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export function DatasetProvider({ children }: { children: ReactNode }) {
    const [uploads, setUploads] = useState<Upload[]>([]);
    const [selectedDataset, setSelectedDataset] = useState<Upload | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            setUploads([]);
            setSelectedDataset(null);
            setLoading(false);
            return;
        }

        // Subscribe to real-time updates from Firestore
        const unsubscribe = subscribeToUserDatasets(user.uid, (datasets) => {
            setUploads(datasets);
            // Keep selectedDataset in sync with the latest Firestore data,
            // and auto-select the first completed dataset if nothing is selected.
            setSelectedDataset((prev) => {
                if (prev) {
                    return datasets.find((d) => d.id === prev.id) ?? prev;
                }
                return datasets.find((d) => d.status === "Completed") ?? null;
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const value = {
        selectedDataset,
        setSelectedDataset,
        uploads,
        loading,
    };

    return (
        <DatasetContext.Provider value={value}>
            {children}
        </DatasetContext.Provider>
    );
}

export const useDataset = () => {
    const context = useContext(DatasetContext);
    if (context === undefined) {
        throw new Error("useDataset must be used within a DatasetProvider");
    }
    return context;
};
