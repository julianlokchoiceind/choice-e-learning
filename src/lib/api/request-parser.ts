/**
 * Request parsing utilities
 * Provides standardized methods for parsing API request data
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { apiError, apiValidationError } from './api-response';

/**
 * Safely parse request JSON body
 * @param req Next.js request object
 * @returns Parsed JSON data or error
 */
export async function parseJsonBody<T = any>(req: NextRequest): Promise<{ 
  success: true; 
  data: T;
} | {
  success: false;
  error: ReturnType<typeof apiError>;
}> {
  try {
    // Get request body as text
    let requestText: string;
    try {
      requestText = await req.text();
    } catch (error) {
      console.error('Error reading request body:', error);
      return {
        success: false,
        error: apiError(
          'Could not read request body',
          (error as Error).message,
          'REQUEST_READ_ERROR',
          400
        )
      };
    }
    
    // Parse JSON
    try {
      const data = JSON.parse(requestText) as T;
      return { success: true, data };
    } catch (error) {
      console.error('JSON parse error:', error);
      return {
        success: false,
        error: apiError(
          'Invalid JSON body',
          (error as Error).message,
          'JSON_PARSE_ERROR',
          400
        )
      };
    }
  } catch (error) {
    console.error('Unexpected error parsing request:', error);
    return {
      success: false,
      error: apiError(
        'Failed to parse request',
        (error as Error).message,
        'REQUEST_PARSE_ERROR',
        400
      )
    };
  }
}

/**
 * Validate request body against Zod schema
 * @param req Next.js request object
 * @param schema Zod schema to validate against
 * @returns Validated data or error
 */
export async function validateRequest<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): Promise<{ 
  success: true; 
  data: T;
} | {
  success: false;
  error: ReturnType<typeof apiError | typeof apiValidationError>;
}> {
  // First parse the JSON body
  const parseResult = await parseJsonBody<unknown>(req);
  
  if (!parseResult.success) {
    return parseResult;
  }
  
  // Then validate against schema
  const validation = schema.safeParse(parseResult.data);
  
  if (!validation.success) {
    return {
      success: false,
      error: apiValidationError(validation.error)
    };
  }
  
  return {
    success: true,
    data: validation.data
  };
}

/**
 * Parse and validate URL search params
 * @param req Next.js request object
 * @param schema Zod schema for query parameters
 * @returns Validated query parameters or error
 */
export function parseQueryParams<T>(
  req: NextRequest,
  schema: z.ZodType<T>
): { 
  success: true; 
  data: T;
} | {
  success: false;
  error: ReturnType<typeof apiError | typeof apiValidationError>;
} {
  try {
    // Get search params as object
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // Validate against schema
    const validation = schema.safeParse(queryParams);
    
    if (!validation.success) {
      return {
        success: false,
        error: apiValidationError(validation.error)
      };
    }
    
    return {
      success: true,
      data: validation.data
    };
  } catch (error) {
    console.error('Error parsing query params:', error);
    return {
      success: false,
      error: apiError(
        'Failed to parse query parameters',
        (error as Error).message,
        'QUERY_PARSE_ERROR',
        400
      )
    };
  }
}

/**
 * Extract path parameter from URL
 * @param req Next.js request object
 * @param paramName Name of the parameter
 * @returns Parameter value
 */
export function getPathParam(req: NextRequest, paramName: string): string | null {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Get index of parameter from route pattern
    // This assumes route patterns like /api/users/[userId]/posts/[postId]
    const patternSegments = req.nextUrl.pathname.split('/').filter(Boolean);
    
    for (let i = 0; i < patternSegments.length; i++) {
      const segment = patternSegments[i];
      // Check if this segment is the parameter we're looking for
      if (segment.startsWith('[') && segment.endsWith(']') && 
          segment.slice(1, -1) === paramName) {
        // Return corresponding value from actual URL if available
        return pathSegments[i] || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting path parameter:', error);
    return null;
  }
}
