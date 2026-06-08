import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Protect Central Hub (Cortex Access)
    // Matches /en/hub, /fa/hub, /hub, etc.
    if (pathname.match(/^\/(en|fa)\/hub/)) {
        const session = request.cookies.get('palm_admin_session');

        // If no valid session cookie, redirect to login
        if (!session || session.value !== 'true') {
            const locale = pathname.split('/')[1] || routing.defaultLocale;
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
        }
    }

    // 2. Standard i18n routing
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(fa|en)/:path*']
};
