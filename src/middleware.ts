import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@/auth";

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export default auth((req) => {
    // 1. Rate Limiting Logic (Only API)
    if (req.nextUrl.pathname.startsWith('/_api')) {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();

        const record = rateLimit.get(ip) || { count: 0, lastReset: now };

        if (now - record.lastReset > WINDOW_MS) {
            record.count = 0;
            record.lastReset = now;
        }

        record.count++;
        rateLimit.set(ip, record);

        if (record.count > MAX_REQUESTS) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    // 2. Auth Protection Logic
    // Protect /dashboard and /editor routes
    const isProtected = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/editor');
    const isE2EBypass = process.env.NODE_ENV !== 'production' && req.headers.get('x-e2e-bypass') === 'true';

    if (isProtected && !req.auth && !isE2EBypass) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    // Matcher excluding static assets and api/auth routes
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
