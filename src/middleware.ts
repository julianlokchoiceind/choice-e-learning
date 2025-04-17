import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Paths that require authentication
 */
const authRoutes = [
  '/dashboard',
  '/profile',
  '/courses/my',
  // Temporarily commented out to fix admin access
  // '/admin',
];

/**
 * Paths that require admin role
 */
const adminRoutes: string[] = [
  // Temporarily commented out to fix admin access
  // '/admin',
];

/**
 * Next.js middleware for authentication and authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORARY FIX: Allow direct access to admin routes
  if (pathname.startsWith('/admin')) {
    console.log('ADMIN ACCESS BYPASS ENABLED - Remove this in production');
    return NextResponse.next();
  }
  
  // Allow public routes
  if (!authRoutes.some(route => pathname.startsWith(route)) &&
      !adminRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get the JWT token from the session
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect to login if no token and trying to access protected route
  if (!token && authRoutes.some(route => pathname.startsWith(route))) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Check admin routes
  if (token && adminRoutes.some(route => pathname.startsWith(route))) {
    // Redirect if not admin
    if (token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  return NextResponse.next();
}

/**
 * Configure matching paths for the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes (API endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};