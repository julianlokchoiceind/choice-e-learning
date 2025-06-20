/**
 * API route handler utilities
 * Provides wrapper functions to simplify route handling and authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, checkUserRole, requireAdmin, requireSelfOrAdmin } from '@/server/auth/auth-middleware';
import { UserRole } from '@/shared/types/auth/roles';
import { apiError, apiServerError, apiUnauthorized, apiForbidden } from './api-response';
import { ApiErrorCode } from './api-errors';

// Định nghĩa kiểu dữ liệu cho route handler
export type RouteParams = Record<string, string>;
export type RouteContext = { params: RouteParams };

// AuthenticatedContext properly extends RouteContext without redefining params
export type AuthenticatedContext = RouteContext & { 
  user: any;
};

// Route parameter extraction helper
export function extractRouteParam(context: RouteContext, paramName: string): string | null {
  return context.params && context.params[paramName] ? context.params[paramName] : null;
}

// Kiểu hàm xử lý route cơ bản
export type HandlerFunction = (
  req: NextRequest,
  context: RouteContext) => Promise<NextResponse | undefined>;

// Kiểu hàm xử lý route đã xác thực
export type AuthenticatedHandlerFunction = (
  req: NextRequest,
  context: AuthenticatedContext) => Promise<NextResponse | undefined>;

/**
 * Wrap a route handler with consistent error handling
 * @param handler The route handler function
 * @returns A wrapped handler with consistent error handling
 */
export function withErrorHandling(handler: HandlerFunction) {
  return async function errorHandlingWrapper(
    req: NextRequest,
    context?: { params?: Record<string, string> | Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    try {
      // Handle async params in Next.js 13+
      let params: Record<string, string> = {};
      if (context?.params) {
        // Check if params is a Promise (Next.js 13+)
        if (context.params instanceof Promise) {
          params = await context.params;
        } else {
          params = context.params;
        }
      }
      
      // Create route context from Next.js params
      const routeContext: RouteContext = {
        params
      };
      
      const result = await handler(req, routeContext);
      if (!result) {
        return apiServerError('Handler returned undefined');
      }
      return result;
    } catch (error: unknown) {
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
export function withAuth(handler: AuthenticatedHandlerFunction) {
  return async function authWrapper(
    req: NextRequest,
    context?: { params?: Record<string, string> | Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    try {
      // Authenticate user
      const auth = await authenticateUser(req);
      
      if (!auth.success) {
        return auth.response || apiUnauthorized();
      }
      
      // Handle async params in Next.js 13+
      let params: Record<string, string> = {};
      if (context?.params) {
        // Check if params is a Promise (Next.js 13+)
        if (context.params instanceof Promise) {
          params = await context.params;
        } else {
          params = context.params;
        }
      }
      
      // Create route context from Next.js params
      const routeContext: RouteContext = {
        params
      };
      
      // Create authenticated context with user data
      const authContext: AuthenticatedContext = {
        ...routeContext,
        user: auth.user
      };
      
      // Call handler with authenticated user
      const result = await handler(req, authContext);
      if (!result) {
        return apiServerError('Authenticated handler returned undefined');
      }
      return result;
    } catch (error: unknown) {
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
 * Wrap a route handler with role-based authentication
 * @param handler The authenticated route handler function
 * @param roles Required role(s)
 * @returns A wrapped handler with role-based authentication
 */
export function withRole(
  handler: AuthenticatedHandlerFunction, 
  roles: UserRole | UserRole[]
) {
  return async function roleWrapper(
    req: NextRequest,
    context?: { params?: Record<string, string> | Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    try {
      // Check user role
      const auth = await checkUserRole(req, roles);
      
      if (!auth.success) {
        return auth.response || apiForbidden();
      }
      
      // Handle async params in Next.js 13+
      let params: Record<string, string> = {};
      if (context?.params) {
        // Check if params is a Promise (Next.js 13+)
        if (context.params instanceof Promise) {
          params = await context.params;
        } else {
          params = context.params;
        }
      }
      
      // Create route context from Next.js params
      const routeContext: RouteContext = {
        params
      };
      
      // Create authenticated context with user data
      const authContext: AuthenticatedContext = {
        ...routeContext,
        user: auth.user
      };
      
      // Call handler with authenticated user
      const result = await handler(req, authContext);
      if (!result) {
        return apiServerError('Role-based handler returned undefined');
      }
      return result;
    } catch (error: unknown) {
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
 * Wrap a route handler with admin-only authentication
 * @param handler The authenticated route handler function
 * @returns A wrapped handler with admin-only authentication
 */
export function withAdmin(handler: AuthenticatedHandlerFunction) {
  // Return a function that matches Next.js route handler signature
  return async function adminWrapper(
    req: NextRequest,
    context?: { params?: Record<string, string> | Promise<Record<string, string>> }
  ): Promise<NextResponse> {
    try {
      
      // Require admin role
      const auth = await requireAdmin(req);
      
      if (!auth.success) {
        return auth.response || apiUnauthorized();
      }
      
      // Handle async params in Next.js 13+
      let params: Record<string, string> = {};
      if (context?.params) {
        // Check if params is a Promise (Next.js 13+)
        if (context.params instanceof Promise) {
          params = await context.params;
        } else {
          params = context.params;
        }
      }
      
      // Create context with params from Next.js
      const routeContext: RouteContext = {
        params
      };
      
      // Create authenticated context with admin user data
      const authContext: AuthenticatedContext = {
        ...routeContext,
        user: auth.user || { id: '', role: UserRole.STUDENT, email: '' }
      };
      
      
      
      // Call handler with authenticated admin user
      const result = await handler(req, authContext);
      if (!result) {
        return apiServerError('Admin handler returned undefined');
      }
      return result;
    } catch (error: unknown) {
      console.error(`Admin API error for ${req.url}:`, error);
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
    } catch (error: unknown) {
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
