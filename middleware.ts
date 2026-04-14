import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Check if the route is within the secure-admin zone
    if (request.nextUrl.pathname.startsWith("/secure-admin")) {
        // Exclude the login page itself to prevent redirect loops
        if (request.nextUrl.pathname.startsWith("/secure-admin/login")) {
            return NextResponse.next();
        }

        const session = request.cookies.get("admin_session")?.value;

        if (session !== "true") {
            const loginUrl = new URL("/secure-admin/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/secure-admin/:path*"],
};
