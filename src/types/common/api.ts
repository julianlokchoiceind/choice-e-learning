/**
 * @file Common API type definitions
 * @description Type definitions for API requests, responses, and related utilities
 */

/**
 * HTTP methods
 * @enum {string}
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * Common API Response interface
 * @template T The type of data returned on success
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Common pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Common paginated response
 * @template T The type of data in the collection
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
