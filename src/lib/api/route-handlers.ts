/**
 * API route handler utilities
 * Provides wrapper functions to simplify route handling and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, checkUserRole, requireAdmin, requireSelfOrAdmin } from '@/lib/auth/auth-middleware';
import { Role } from '@/lib/auth/auth-options';
import { apiError, apiServerError, apiUnauthorized } from './api-response';

type HandlerFunction = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

type AuthenticatedHandlerFunction = (
  req: NextRequest,
  context: { 
    params: Record<string, string>,
    user: any
  }
) => Promise<NextResponse>;

/**
 * Wrap a route handler with consistent error handling
 * @param handler The route handler function
 * @returns A wrapped handler with consistent error handling
 */
export function withErrorHandling(handler: HandlerFunction): HandlerFunction {
  return async (req, context) => {
    try {
      return await handler(req, context);
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
  return withErrorHandling(async (req, context) => {
    // Authenticate user
    const auth = await authenticateUser(req);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Call handler with authenticated user
    return await handler(req, { ...context, user: auth.user });
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
  return withErrorHandling(async (req, context) => {
    // Check user role
    const auth = await checkUserRole(req, roles);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Call handler with authenticated user
    return await handler(req, { ...context, user: auth.user });
  });
}

/**
 * Wrap a route handler with admin-only authentication
 * @param handler The authenticated route handler function
 * @returns A wrapped handler with admin-only authentication
 */
export function withAdmin(handler: AuthenticatedHandlerFunction): HandlerFunction {
  return withErrorHandling(async (req, context) => {
    // Require admin role
    const auth = await requireAdmin(req);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Call handler with authenticated admin user
    return await handler(req, { ...context, user: auth.user });
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
  getResourceOwnerId: (req: NextRequest, context: { params: Record<string, string> }) => string | Promise<string>
): HandlerFunction {
  return withErrorHandling(async (req, context) => {
    // Get resource owner ID
    const ownerId = await getResourceOwnerId(req, context);
    
    if (!ownerId) {
      return apiError('Resource owner not found', undefined, 'OWNER_NOT_FOUND', 404);
    }
    
    // Check if user is resource owner or admin
    const auth = await requireSelfOrAdmin(req, ownerId);
    
    if (!auth.success) {
      return auth.response;
    }
    
    // Call handler with authenticated user
    return await handler(req, { ...context, user: auth.user });
  });
}

/**
 * Creates a Next.js API route handler with method routing
 * @param handlers Object mapping HTTP methods to handler functions
 * @returns A handler function for the Next.js API route
 */
export function createRouteHandler(
  handlers: Partial<Record<string, HandlerFunction>>
): (req: NextRequest, context: { params: Record<string, string> }) => Promise<NextResponse> {
  return async (req, context) => {
    const method = req.method;
    
    // Check if method is supported
    if (!method || !handlers[method]) {
      return apiError(
        `Method ${method || 'unknown'} not allowed`,
        undefined,
        'METHOD_NOT_ALLOWED',
        405
      );
    }
    
    // Call the appropriate handler
    try {
      return await handlers[method]!(req, context);
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
