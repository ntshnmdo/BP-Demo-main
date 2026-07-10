import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  const publicRoutes = ['/login', '/public-passport', '/api'];
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow static files and root redirect
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Check for auth token in cookies (set by authStore.setAuth)
  const cookieToken = request.cookies.get('auth-token')?.value;
  // Also accept token from Authorization header (API calls)
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');

  const hasToken = !!(cookieToken || headerToken);

  if (!hasToken) {
    // Preserve the intended destination for post-login redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Prevent browser from caching this redirect — avoids the back-button loop
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  const response = NextResponse.next();
  // Never cache auth-gated pages — prevents stale back-navigation
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

