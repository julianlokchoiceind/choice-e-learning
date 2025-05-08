import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/shared/types/auth/roles';

/**
 * Auth middleware for protected routes
 */
export async function authMiddleware(req: NextRequest, requiredRole?: UserRole) {
  try {
    // Get the JWT token from the session
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // Check if user is authenticated
    if (!token || !token.id) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      };
    }
    
    // Check if user has required role
    if (requiredRole) {
      const userRole = token.role as UserRole;
      
      // Admin role check
      if (requiredRole === UserRole.ADMIN && userRole !== UserRole.ADMIN) {
        return {
          success: false,
          response: NextResponse.json(
            { success: false, error: 'Admin privileges required' },
            { status: 403 }
          )
        };
      }
    }
    
    // Return success with user information
    return {
      success: true,
      user: {
        id: token.id as string,
        role: token.role as UserRole,
      }
    };
  } catch (error: unknown) {
    console.error('Auth middleware error:', error);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      )
    };
  }
}

/**
 * Admin middleware for admin-only routes
 */
export async function adminMiddleware(req: NextRequest) {
  return authMiddleware(req, UserRole.ADMIN);
}

/**
 * Authentication middleware for user-only routes
 * @param req The incoming request
 * @returns NextResponse with the appropriate status code and message
 */
export async function authenticationMiddleware(req: NextRequest) {
  return authMiddleware(req, UserRole.STUDENT);
}