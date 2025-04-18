import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, Role } from './auth-options';
import { hasRole, isAdmin, hasPermission } from './roles';
import { AuthErrorCode, getAuthError } from './utils/auth-errors';

/**
 * Get the authenticated user's session
 * @returns The session object or null if not authenticated
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Middleware to check if user is authenticated
 * @param req Next request object
 * @returns Authentication result with user data or error response
 */
export async function authenticateUser(req: NextRequest) {
  const session = await getAuthSession();
  
  if (!session?.user) {
    const error = getAuthError(AuthErrorCode.UNAUTHORIZED);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    };
  }
  
  return {
    success: true,
    session,
    user: session.user
  };
}

/**
 * Check if user has required role(s)
 * @param req Next request object
 * @param roles Required role(s)
 * @returns Authentication result with user data or error response
 */
export async function checkUserRole(req: NextRequest, roles: Role | Role[]) {
  const auth = await authenticateUser(req);
  
  if (!auth.success) {
    return auth;
  }
  
  // TypeScript knows auth.user exists if auth.success is true
  const userRole = auth.user?.role;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  // Admin role has access to everything
  if (isAdmin(auth.user)) {
    return auth;
  }
  
  // Check if user has one of the allowed roles
  if (!userRole || !allowedRoles.some(role => hasRole(auth.user, role))) {
    const error = getAuthError(AuthErrorCode.FORBIDDEN);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    };
  }
  
  return auth;
}

/**
 * Check if user is admin
 * @param req Next request object
 * @returns Authentication result with user data or error response
 */
export async function requireAdmin(req: NextRequest) {
  return await checkUserRole(req, Role.admin);
}

/**
 * Check if user has permission to access a resource
 * @param req Next request object
 * @param userId Resource owner ID
 * @returns Authentication result with user data or error response
 */
export async function requireSelfOrAdmin(req: NextRequest, userId: string) {
  const auth = await authenticateUser(req);
  
  if (!auth.success) {
    return auth;
  }
  
  // Check if user has permission to access the resource
  if (!hasPermission(auth.user, userId)) {
    const error = getAuthError(AuthErrorCode.FORBIDDEN);
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      )
    };
  }
  
  return auth;
}