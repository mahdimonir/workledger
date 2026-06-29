import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
const APP_PATHS = ['/dashboard', '/clients', '/projects', '/invoices', '/proposals', '/team', '/settings', '/reports', '/expenses', '/notifications'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('refreshToken') || req.cookies.has('wl_logged_in');
  const hasOnboarded = req.cookies.has('wl_onboarding_complete');

  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/portal') || pathname.startsWith('/legal')) {
    return NextResponse.next();
  }

  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  if (APP_PATHS.some((path) => pathname.startsWith(path))) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (!hasOnboarded) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/onboarding')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (hasOnboarded) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
