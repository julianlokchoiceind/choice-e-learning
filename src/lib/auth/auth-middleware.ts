import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { Role } from '@/types/auth/roles';
import { apiUnauthorized, apiForbidden } from '@/lib/api/api-response';

/**
 * Get the authenticated session and create a standard response
 * @param req The Next.js request
 * @returns An object containing the session, user, and response
 */
export async function getAuthSession(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions).catch(error => {
      console.error('Error getting server session:', error);
      return null;
    });
    
    return {
      session,
      user: session?.user || null
    };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return {
      session: null,
      user: null
    };
  }
}

/**
 * Authenticate a user and ensure they are logged in
 * @param req The Next.js request
 * @returns An object with success and user data
 */
export async function authenticateUser(req: NextRequest) {
  try {
    // Get the authenticated session
    const { session, user } = await getAuthSession(req);
    
    // Check if user is authenticated
    if (!session || !user) {
      return {
        success: false,
        response: apiUnauthorized()
      };
    }
    
    // Return the authenticated user
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: apiUnauthorized()
    };
  }
}

/**
 * Check if the authenticated user has the required role
 * @param req The Next.js request
 * @param requiredRoles Single role or array of roles required
 * @returns An object with success and user data
 */
export async function checkUserRole(req: NextRequest, requiredRoles: Role | Role[]) {
  try {
    // Authenticate the user first
    const auth = await authenticateUser(req);
    
    if (!auth.success || !auth.user) {
      return auth;
    }
    
    // Convert requiredRoles to an array if it's not already
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check if user has any of the required roles
    if (!roles.includes(auth.user.role)) {
      return {
        success: false,
        response: apiForbidden()
      };
    }
    
    // User is authenticated and has the required role
    return {
      success: true,
      user: auth.user
    };
  } catch (error) {
    console.error('Role check error:', error);
    return {
      success: false,
      response: apiUnauthorized()
    };
  }
}

/**
 * Require admin role for authentication
 * @param req The Next.js request
 * @returns An object with success and user data
 */
export async function requireAdmin(req: NextRequest) {
  return checkUserRole(req, Role.admin);
}

/**
 * Check if user is authenticated and is either the resource owner or an admin
 * @param req The Next.js request
 * @param ownerId Resource owner ID
 * @returns An object with success and user data
 */
export async function requireSelfOrAdmin(_req: NextRequest, ownerId: string) {
  try {
    // Get the authenticated user
    const { session, user } = await getAuthSession(_req);
    
    // Check if user is authenticated
    if (!session || !user) {
      return {
        success: false,
        response: apiUnauthorized()
      };
    }
    
    // Check if user is the resource owner or an admin
    if (user.id !== ownerId && user.role !== Role.admin) {
      return {
        success: false,
        response: apiForbidden()
      };
    }
    
    // User is authenticated and authorized
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Owner/admin check error:', error);
    return {
      success: false,
      response: apiUnauthorized()
    };
  }
}