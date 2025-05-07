/**
 * Utilities for handling pagination in data queries
 */

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface for a paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Calculate pagination parameters for database queries
 * @param page The page number (1-indexed)
 * @param limit The number of items per page
 * @returns The skip and take parameters for Prisma
 */
export function getPaginationParams(page = 1, limit = 10) {
  const validPage = Math.max(1, page); // Ensure page is at least 1
  const validLimit = Math.min(Math.max(1, limit), 100); // Limit between 1 and 100
  const skip = (validPage - 1) * validLimit;
  return { skip, take: validLimit };
}

/**
 * Create a paginated response
 * @param data The data to paginate
 * @param totalItems The total number of items
 * @param page The current page number
 * @param limit The number of items per page
 * @returns A paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  totalItems: number,
  page = 1,
  limit = 10
): PaginatedResponse<T> {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100);
  const totalPages = Math.ceil(totalItems / validLimit);
  
  return {
    data,
    meta: {
      page: validPage,
      limit: validLimit,
      totalItems,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPreviousPage: validPage > 1,
    },
  };
}

/**
 * Calculate the total number of pages
 * @param totalItems The total number of items
 * @param limit The number of items per page
 * @returns The total number of pages
 */
export function getTotalPages(totalItems: number, limit = 10): number {
  const validLimit = Math.min(Math.max(1, limit), 100);
  return Math.ceil(totalItems / validLimit);
}

/**
 * Generate page links for pagination
 * @param baseUrl The base URL for the links
 * @param page The current page
 * @param totalPages The total number of pages
 * @param limit The number of items per page
 * @returns An object with links for first, last, next, and previous pages
 */
export function generatePageLinks(
  baseUrl: string,
  page: number,
  totalPages: number,
  limit: number
) {
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100);
  const sanitizedBaseUrl = baseUrl.endsWith('?') 
    ? baseUrl.slice(0, -1) 
    : baseUrl;
  
  const links = {
    first: `${sanitizedBaseUrl}?page=1&limit=${validLimit}`,
    last: `${sanitizedBaseUrl}?page=${totalPages}&limit=${validLimit}`,
    next: null as string | null,
    prev: null as string | null,
  };

  if (validPage < totalPages) {
    links.next = `${sanitizedBaseUrl}?page=${validPage + 1}&limit=${validLimit}`;
  }

  if (validPage > 1) {
    links.prev = `${sanitizedBaseUrl}?page=${validPage - 1}&limit=${validLimit}`;
  }

  return links;
}

/**
 * Extract pagination parameters from a query object
 * @param query Object containing query parameters
 * @returns Validated pagination parameters
 */
export function extractPaginationParams(query): PaginationParams {
  const page = query?.page ? Number(query.page) : 1;
  const limit = query?.limit ? Number(query.limit) : 10;
  
  return {
    page: isNaN(page) ? 1 : Math.max(1, page),
    limit: isNaN(limit) ? 10 : Math.min(Math.max(1, limit), 100),
  };
}