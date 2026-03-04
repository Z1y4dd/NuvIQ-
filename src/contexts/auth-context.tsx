"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signUp: async () => {},
    signIn: async () => {},
    signInWithGoogle: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = async (email: string, password: string, name: string) => {
        if (!auth || !db) {
            throw new Error("Firebase is not initialized");
        }

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
        );

        // Create user document in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email,
            name,
            createdAt: new Date().toISOString(),
        });
    };

    const signIn = async (email: string, password: string) => {
        if (!auth) {
            throw new Error("Firebase is not initialized");
        }
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = async () => {
        if (!auth) throw new Error("Firebase is not initialized");
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        // Create/update user doc in Firestore if it doesn't exist
        if (db) {
            const userRef = doc(db, "users", credential.user.uid);
            const snap = await getDoc(userRef);
            if (!snap.exists()) {
                await setDoc(userRef, {
                    email: credential.user.email,
                    name: credential.user.displayName || "",
                    createdAt: new Date().toISOString(),
                });
            }
        }
    };

    const signOut = async () => {
        if (!auth) {
            throw new Error("Firebase is not initialized");
        }
        await firebaseSignOut(auth);
    };

    const resetPassword = async (email: string) => {
        if (!auth) {
            throw new Error("Firebase is not initialized");
        }
        await sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
