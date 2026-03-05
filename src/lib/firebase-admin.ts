import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

function getAdminApp(): App | null {
    if (adminApp) return adminApp;
    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return adminApp;
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    try {
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            // Service account JSON path is set — use it
            adminApp = initializeApp({
                credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
                projectId,
            });
        } else {
            // Fallback: project-id only init (works on GCP with ADC)
            adminApp = initializeApp({ projectId });
        }
        return adminApp;
    } catch (error: any) {
        console.warn(
            "Firebase Admin SDK initialization failed:",
            error.message,
        );
        return null;
    }
}

/**
 * Get the Admin Auth instance, or null if Admin SDK couldn't be initialized.
 */
export function getAdminAuth(): Auth | null {
    if (_adminAuth) return _adminAuth;
    const app = getAdminApp();
    if (!app) return null;
    try {
        _adminAuth = getAuth(app);
        return _adminAuth;
    } catch {
        return null;
    }
}

/**
 * Get the Admin Firestore instance, or null if Admin SDK couldn't be initialized.
 */
export function getAdminDb(): Firestore | null {
    if (_adminDb) return _adminDb;
    const app = getAdminApp();
    if (!app) return null;
    try {
        _adminDb = getFirestore(app);
        return _adminDb;
    } catch {
        return null;
    }
}
