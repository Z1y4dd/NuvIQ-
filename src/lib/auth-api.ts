import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "./firebase-admin";

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Uses firebase-admin verifyIdToken when available (production).
 * Falls back to decoding the JWT payload without cryptographic verification
 * when the Admin SDK has no credentials (local development).
 *
 * Returns the decoded UID on success, or a NextResponse error on failure.
 */
export async function verifyAuthToken(
    req: NextRequest,
): Promise<{ uid: string } | NextResponse> {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing or malformed Authorization header" },
            { status: 401 },
        );
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Try cryptographic verification via Admin SDK first
    const adminAuth = getAdminAuth();
    if (adminAuth) {
        try {
            const decoded = await adminAuth.verifyIdToken(idToken);
            return { uid: decoded.uid };
        } catch (error: any) {
            console.error("Token verification failed:", error.message);
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 },
            );
        }
    }

    // Fallback: decode JWT payload without cryptographic verification
    // This is acceptable for local dev where the token comes from our own client
    try {
        const payload = JSON.parse(
            Buffer.from(idToken.split(".")[1], "base64").toString("utf-8"),
        );
        const uid = payload.user_id || payload.sub;
        if (!uid) {
            return NextResponse.json(
                { error: "Could not extract UID from token" },
                { status: 401 },
            );
        }
        console.warn(
            "⚠️  Using unverified token decode (no Admin SDK credentials). OK for local dev only.",
        );
        return { uid };
    } catch {
        return NextResponse.json(
            { error: "Invalid token format" },
            { status: 401 },
        );
    }
}
