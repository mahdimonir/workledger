import { NextRequest, NextResponse } from 'next/server';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];
const APP_PATHS = ['/dashboard', '/clients', '/projects', '/invoices', '/proposals', '/team', '/settings', '/reports', '/expenses', '/notifications'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('refreshToken');
  const hasOnboarded = req.cookies.has('wl_onboarding_complete');

  // 1. Google callback or public portal pages should pass through
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/portal') || pathname.startsWith('/legal')) {
    return NextResponse.next();
  }

  // 2. Auth pages (login, signup, etc.) -> redirect to dashboard if logged in
  if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 3. App pages -> redirect to login if not logged in; redirect to onboarding if not onboarded
  if (APP_PATHS.some((path) => pathname.startsWith(path))) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (!hasOnboarded) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
    return NextResponse.next();
  }

  // 4. Onboarding pages -> redirect to login if not logged in; redirect to dashboard if already onboarded
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
