/**
 * API route handler utilities
 * Provides wrapper functions to simplify route handling and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, checkUserRole, requireAdmin, requireSelfOrAdmin } from '@/lib/auth/auth-middleware';
import { Role } from '@/types/auth/roles';
import { apiError, apiServerError, apiUnauthorized } from './api-response';
import { ApiErrorCode } from './api-error-codes';

// Định nghĩa kiểu dữ liệu cho route handler
type RouteContext = { params: Record<string, string> };
type AuthenticatedContext = RouteContext & { user: any };

// Kiểu hàm xử lý route cơ bản
type HandlerFunction = (
  req: NextRequest,
  context: RouteContext
) => Promise<NextResponse | undefined>;

// Kiểu hàm xử lý route đã xác thực
type AuthenticatedHandlerFunction = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse | undefined>;

/**
 * Wrap a route handler with consistent error handling
 * @param handler The route handler function
 * @returns A wrapped handler with consistent error handling
 */
export function withErrorHandling(handler: HandlerFunction): HandlerFunction {
  return async function errorHandlingWrapper(req, context) {
    try {
      const result = await handler(req, context);
      return result || apiServerError('Handler returned undefined');
    } catch (error) {
      console.error(`API error [${req.method} ${req.nextUrl.pathname}]:`, error);
      console.error('Error stack:', (error as Error).stack);
      
      // Return standardized error response
      return apiServerError(
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined
      );
    }
  };
}

/**
 * Wrap a route handler with authentication
 * @param handler The authenticated route handler function
 * @returns A wrapped handler with authentication and error handling
 */
export function withAuth(handler: AuthenticatedHandlerFunction): HandlerFunction {
  return withErrorHandling(async function authWrapper(req, context) {
    // Authenticate user
    const auth = await authenticateUser(req);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Create new context with user data
    const authContext: AuthenticatedContext = {
      ...context,
      user: auth.user
    };
    
    // Call handler with authenticated user
    const result = await handler(req, authContext);
    return result || apiServerError('Authenticated handler returned undefined');
  });
}

/**
 * Wrap a route handler with role-based authentication
 * @param handler The authenticated route handler function
 * @param roles Required role(s)
 * @returns A wrapped handler with role-based authentication
 */
export function withRole(
  handler: AuthenticatedHandlerFunction, 
  roles: Role | Role[]
): HandlerFunction {
  return withErrorHandling(async function roleWrapper(req, context) {
    // Check user role
    const auth = await checkUserRole(req, roles);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Create new context with user data
    const authContext: AuthenticatedContext = {
      ...context,
      user: auth.user
    };
    
    // Call handler with authenticated user
    const result = await handler(req, authContext);
    return result || apiServerError('Role-based handler returned undefined');
  });
}

/**
 * Wrap a route handler with admin-only authentication
 * @param handler The authenticated route handler function
 * @returns A wrapped handler with admin-only authentication
 */
export function withAdmin(handler: AuthenticatedHandlerFunction): HandlerFunction {
  return withErrorHandling(async function adminWrapper(req, context) {
    // Require admin role
    const auth = await requireAdmin(req);
    
    if (!auth.success) {
      console.log('Admin authentication failed for:', req.url);
      console.log('Auth error:', auth);
      return auth.response;
    }
    
    // Create new context with admin user data
    const authContext: AuthenticatedContext = {
      ...context,
      user: auth.user
    };
    
    console.log(`Admin API access granted for ${auth.user.email} to ${req.url}`);
    console.log('User data:', {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.user.role
    });
    
    // Call handler with authenticated admin user
    try {
      const result = await handler(req, authContext);
      console.log(`Admin API response for ${req.url} sent successfully`);
      return result || apiServerError('Admin handler returned undefined');
    } catch (error) {
      console.error(`Admin API error for ${req.url}:`, error);
      throw error;
    }
  });
}

/**
 * Wrap a route handler with resource ownership check
 * @param handler The authenticated route handler function
 * @param getResourceOwnerId Function to get resource owner ID from request
 * @returns A wrapped handler with resource ownership check
 */
export function withOwnership(
  handler: AuthenticatedHandlerFunction,
  getResourceOwnerId: (req: NextRequest, context: RouteContext) => string | Promise<string>
): HandlerFunction {
  return withErrorHandling(async function ownershipWrapper(req, context) {
    // Get resource owner ID
    const ownerId = await getResourceOwnerId(req, context);
    
    if (!ownerId) {
      return apiError('Resource owner not found', undefined, ApiErrorCode.NOT_FOUND, 404);
    }
    
    // Check if user is resource owner or admin
    const auth = await requireSelfOrAdmin(req, ownerId);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Create new context with user data
    const authContext: AuthenticatedContext = {
      ...context,
      user: auth.user
    };
    
    // Call handler with authenticated user
    const result = await handler(req, authContext);
    return result || apiServerError('Ownership handler returned undefined');
  });
}

/**
 * Creates a Next.js API route handler with method routing
 * @param handlers Object mapping HTTP methods to handler functions
 * @returns A handler function for the Next.js API route
 */
export function createRouteHandler(
  handlers: Partial<Record<string, HandlerFunction>>
): HandlerFunction {
  return async function routeHandler(req, context) {
    const method = req.method;
    
    // Check if method is supported
    if (!method || !handlers[method]) {
      return apiError(
        `Method ${method || 'unknown'} not allowed`,
        undefined,
        ApiErrorCode.METHOD_NOT_ALLOWED,
        405
      );
    }
    
    // Call the appropriate handler
    try {
      const handler = handlers[method]!;
      const result = await handler(req, context);
      return result || apiServerError(`Handler for method ${method} returned undefined`);
    } catch (error) {
      console.error(`API error [${method} ${req.nextUrl.pathname}]:`, error);
      console.error('Error stack:', (error as Error).stack);
      
      // Return standardized error response
      return apiServerError(
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined
      );
    }
  };
}
