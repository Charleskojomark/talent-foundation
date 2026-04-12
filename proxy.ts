import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect all /admin routes except /admin/login
    if (path.startsWith('/admin') && path !== '/admin/login') {
        const adminSession = request.cookies.get('admin_session')?.value;

        if (!adminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Redirect logged-in admin from /admin/login to /admin
    if (path === '/admin/login') {
        const adminSession = request.cookies.get('admin_session')?.value;

        if (adminSession) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
}
