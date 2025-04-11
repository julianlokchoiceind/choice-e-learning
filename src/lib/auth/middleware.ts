import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from './auth-options';

/**
 * Authentication middleware for protected routes
 * @param req The incoming request
 * @param requiredRole The role required to access the resource
 * @returns NextResponse with the appropriate status code and message
 */
export async function authMiddleware(req: NextRequest, requiredRole: Role = Role.student) {
  // Get the JWT token from the request
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token is found, the user is not authenticated
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Check if the user has the required role
  const userRole = token.role as Role;
  
  if (requiredRole === Role.admin && userRole !== Role.admin) {
    return NextResponse.json(
      { error: 'Admin privileges required' },
      { status: 403 }
    );
  }

  if (requiredRole === Role.instructor && 
     !(userRole === Role.instructor || userRole === Role.admin)) {
    return NextResponse.json(
      { error: 'Instructor privileges required' },
      { status: 403 }
    );
  }

  // User is authenticated and has the required role
  return NextResponse.next();
}

/**
 * Admin middleware for admin-only routes
 * @param req The incoming request
 * @returns NextResponse with the appropriate status code and message
 */
export async function adminMiddleware(req: NextRequest) {
  return authMiddleware(req, Role.admin);
}

/**
 * Instructor middleware for instructor-only routes
 * @param req The incoming request
 * @returns NextResponse with the appropriate status code and message
 */
export async function instructorMiddleware(req: NextRequest) {
  return authMiddleware(req, Role.instructor);
}

/**
 * Authentication middleware for user-only routes
 * @param req The incoming request
 * @returns NextResponse with the appropriate status code and message
 */
export async function authenticationMiddleware(req: NextRequest) {
  return authMiddleware(req, Role.student);
}