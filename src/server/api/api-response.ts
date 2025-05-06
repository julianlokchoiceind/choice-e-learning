/**
 * Standard API response utilities
 * Provides consistent formatting for all API responses
 */

import { NextResponse } from 'next/server';
import { ApiErrorCode, getDefaultErrorMessage, errorCodeToStatusMap } from './api-error-codes';

export type ApiSuccessResponse<T = any> = {
  success: true;
  data: T;
  message?: string;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    [key: string]: any;
  };
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: string | string[] | Record<string, any>;
  code?: ApiErrorCode | string;
};

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Format a successful API response
 * @param data Response data
 * @param message Optional success message
 * @param meta Optional metadata (like pagination)
 * @param status HTTP status code (default: 200)
 * @returns NextResponse with formatted success response
 */
export function apiSuccess<T = any>(
  data: T,
  message?: string,
  meta?: ApiSuccessResponse['meta'],
  status = 200
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
    ...(meta && { meta })
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Format an error API response
 * @param error Error message
 * @param details Optional error details
 * @param code Optional error code
 * @param status HTTP status code (default: 400)
 * @returns NextResponse with formatted error response
 */
export function apiError(
  error: string | ApiErrorCode,
  details?: ApiErrorResponse['details'],
  code?: ApiErrorCode,
  status?: number
): NextResponse {
  // If error is an ApiErrorCode enum value
  if (Object.values(ApiErrorCode).includes(error as ApiErrorCode)) {
    const errorCode = error as ApiErrorCode;
    const response: ApiErrorResponse = {
      success: false,
      error: getDefaultErrorMessage(errorCode),
      code: errorCode,
      ...(details && { details })
    };
    
    return NextResponse.json(response, { 
      status: status ?? errorCodeToStatusMap[errorCode] 
    });
  }
  
  // If error is a string message
  const response: ApiErrorResponse = {
    success: false,
    error: error as string,
    ...(details && { details }),
    ...(code && { code })
  };
  
  const statusCode = code ? errorCodeToStatusMap[code] : status ?? 400;
  
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Format validation errors from Zod
 * @param zodError Zod validation error
 * @returns NextResponse with formatted validation error
 */
export function apiValidationError(zodError: any): NextResponse {
  const errorDetails = zodError.errors.map((err: any) => 
    `${err.path.join('.')}: ${err.message}`
  );
  
  return apiError(
    getDefaultErrorMessage(ApiErrorCode.VALIDATION_ERROR),
    errorDetails,
    ApiErrorCode.VALIDATION_ERROR
  );
}

/**
 * Create a success response for a created resource
 * @param data Created resource data
 * @param message Optional success message
 * @returns NextResponse with 201 status code
 */
export function apiCreated<T = any>(
  data: T,
  message = 'Resource created successfully'
): NextResponse {
  return apiSuccess(data, message, undefined, 201);
}

/**
 * Create a success response for an updated resource
 * @param data Updated resource data
 * @param message Optional success message
 * @returns NextResponse with success status code
 */
export function apiUpdated<T = any>(
  data: T,
  message = 'Resource updated successfully'
): NextResponse {
  return apiSuccess(data, message);
}

/**
 * Create a success response for a deleted resource
 * @param message Optional success message
 * @returns NextResponse with success status code
 */
export function apiDeleted(
  message = 'Resource deleted successfully'
): NextResponse {
  return apiSuccess(null, message);
}

/**
 * Create a not found error response
 * @param resource Resource type
 * @returns NextResponse with 404 status code
 */
export function apiNotFound(resource = 'Resource'): NextResponse {
  return apiError(
    `${resource} not found`,
    undefined,
    ApiErrorCode.NOT_FOUND
  );
}

/**
 * Create an unauthorized error response
 * @param message Optional custom message
 * @returns NextResponse with 401 status code
 */
export function apiUnauthorized(
  message?: string
): NextResponse {
  return apiError(
    message ?? getDefaultErrorMessage(ApiErrorCode.UNAUTHORIZED),
    undefined,
    ApiErrorCode.UNAUTHORIZED
  );
}

/**
 * Create a forbidden error response
 * @param message Optional custom message
 * @returns NextResponse with 403 status code
 */
export function apiForbidden(
  message?: string
): NextResponse {
  return apiError(
    message ?? getDefaultErrorMessage(ApiErrorCode.FORBIDDEN),
    undefined,
    ApiErrorCode.FORBIDDEN
  );
}

/**
 * Create a server error response
 * @param message Optional custom message
 * @param details Optional error details
 * @returns NextResponse with 500 status code
 */
export function apiServerError(
  message?: string,
  details?: string | Record<string, any>
): NextResponse {
  return apiError(
    message ?? getDefaultErrorMessage(ApiErrorCode.SERVER_ERROR),
    details,
    ApiErrorCode.SERVER_ERROR
  );
}
