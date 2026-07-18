import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeSession } from '@/lib/session';

const protectedPaths = ['/roulette', '/record', '/feedback'];
const publicApiPaths = ['/api/access'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('actor-coach-session')?.value;

  // API routes: validate session for protected APIs
  if (pathname.startsWith('/api/') && !publicApiPaths.some((p) => pathname.startsWith(p))) {
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const session = decodeSession(sessionCookie);
    if (!session || !session.accessGranted) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // Page routes: redirect to / if no session
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const session = decodeSession(sessionCookie);
    if (!session || !session.accessGranted) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/).*)',
  ],
};
