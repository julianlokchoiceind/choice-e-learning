import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/auth-options';
import { UserRole } from '@/shared/types/auth/roles';
import { apiUnauthorized, apiForbidden } from '@/server/api/api-response';

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
  } catch (error: unknown) {
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
  } catch (error: unknown) {
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
export async function checkUserRole(req: NextRequest, requiredRoles: UserRole | UserRole[]) {
  try {
    // Authenticate the user first
    const auth = await authenticateUser(req);
    
    if (!auth.success || !auth.user) {
      return auth;
    }
    
    // Convert requiredRoles to an array if it's not already
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Convert user role to string for comparison
    const userRole = String(auth.user.role).toLowerCase();
    
    // Check if user has any of the required roles
    const hasRole = roles.some(role => {
      const roleStr = String(role).toLowerCase();
      return roleStr === userRole;
    });
    
    if (!hasRole) {
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
  } catch (error: unknown) {
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
  return checkUserRole(req, UserRole.ADMIN);
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
    const userRole = String(user.role).toLowerCase();
    if (user.id !== ownerId && userRole !== UserRole.ADMIN.toLowerCase()) {
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
  } catch (error: unknown) {
    console.error('Owner/admin check error:', error);
    return {
      success: false,
      response: apiUnauthorized()
    };
  }
}

// Handler type for Next.js App Router
type RouteHandler = (
  req: NextRequest,
  context: any
) => Promise<NextResponse>;

/**
 * Higher-order function to protect API routes with authentication
 * Compatible with both App Router and Pages Router
 */
export function withAuth(
  handler: RouteHandler,
  options?: { roles?: UserRole | UserRole[] }
): RouteHandler {
  return async (req: NextRequest, context: any) => {
    try {
      // Get the authenticated session
      const { session, user } = await getAuthSession(req);
      
      // Check if user is authenticated
      if (!session || !user) {
        return apiUnauthorized();
      }
      
      // Check roles if specified
      if (options?.roles) {
        const roles = Array.isArray(options.roles) ? options.roles : [options.roles];
        const userRole = String(user.role).toLowerCase();
        
        const hasRequiredRole = roles.some(role => 
          String(role).toLowerCase() === userRole
        );
        
        if (!hasRequiredRole) {
          return apiForbidden();
        }
      }
      
      // Add session to context
      const contextWithSession = {
        ...context,
        session,
        user
      };
      
      // Call the handler with the authenticated context
      return handler(req, contextWithSession);
    } catch (error: any) {
      console.error('Auth middleware error:', error);
      return apiUnauthorized(error?.message || 'Authentication error');
    }
  };
}

/**
 * Middleware to check if user has admin role
 */
export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return withAuth(handler, { roles: [UserRole.ADMIN] });
}