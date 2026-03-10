import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_TOKEN_KEY = 'etl_token';
const STUDENT_TOKEN_KEY = 'student_token';

export function middleware(request: NextRequest) {
  const adminToken = request.cookies.get(ADMIN_TOKEN_KEY)?.value;
  const studentToken = request.cookies.get(STUDENT_TOKEN_KEY)?.value;
  const { pathname } = request.nextUrl;

  // Admin routes
  if (pathname.startsWith('/dashboard')) {
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin login redirect if already logged in
  if (pathname === '/login' && adminToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Student protected routes
  if (pathname.startsWith('/student/profile') || pathname.startsWith('/student/recommendations')) {
    if (!studentToken) {
      return NextResponse.redirect(new URL('/student/login', request.url));
    }
    return NextResponse.next();
  }

  // Student login/signup redirect if already logged in
  if ((pathname === '/student/login' || pathname === '/student/signup') && studentToken) {
    return NextResponse.redirect(new URL('/student/recommendations', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
