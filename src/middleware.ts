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
  '/admin',
];

/**
 * Paths that require admin role
 */
const adminRoutes = [
  '/admin',
];

/**
 * Paths that require instructor role
 */
const instructorRoutes = [
  '/instructor',
  '/courses/create',
  '/courses/edit',
];

/**
 * Next.js middleware for authentication and authorization
 */
export async function middleware(request: NextRequest) {
  // Start with logging
  const startTime = Date.now();
  const method = request.method;
  const url = request.url;
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
  
  const { pathname } = request.nextUrl;
  
  // CORS handling
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = ['http://localhost:3000', process.env.NEXTAUTH_URL || ''];
  
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  } as Record<string, string>;
  
  if (allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders, status: 200 });
  }
  
  // Allow public routes
  if (!authRoutes.some(route => pathname.startsWith(route)) &&
      !adminRoutes.some(route => pathname.startsWith(route)) &&
      !instructorRoutes.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    
    // Add CORS headers to the response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add timing metrics
    const duration = Date.now() - startTime;
    response.headers.set('X-Response-Time', `${duration}ms`);
    
    return response;
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
  
  // Check instructor routes
  if (token && instructorRoutes.some(route => pathname.startsWith(route))) {
    // Redirect if not instructor or admin
    if (token.role !== 'instructor' && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  const response = NextResponse.next();
  
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add timing metrics
  const duration = Date.now() - startTime;
  response.headers.set('X-Response-Time', `${duration}ms`);
  console.log(`Request to ${request.url} took ${duration}ms`);
  
  return response;
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