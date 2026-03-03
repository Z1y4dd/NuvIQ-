import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // This is a client-side routing guard - the actual auth check happens on the client
    // For now, we just let the request through and the client components will handle auth
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*"],
};
