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
 * Calculate pagination parameters
 * @param page The page number (1-indexed)
 * @param limit The number of items per page
 * @returns The skip and take parameters for Prisma
 */
export function getPaginationParams(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
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
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Calculate the total number of pages
 * @param totalItems The total number of items
 * @param limit The number of items per page
 * @returns The total number of pages
 */
export function getTotalPages(totalItems: number, limit: number = 10): number {
  return Math.ceil(totalItems / limit);
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
  const links = {
    first: `${baseUrl}?page=1&limit=${limit}`,
    last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
    next: null as string | null,
    prev: null as string | null,
  };

  if (page < totalPages) {
    links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
  }

  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }

  return links;
} 