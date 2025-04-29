/**
 * @file Topic type definitions
 * @description Type definitions for topics used across the application
 */

/**
 * Topic interface
 */
export interface Topic {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    courses?: number;
  };
  courseIds?: string[];
}

/**
 * Topic filter interface for querying topics
 */
export interface TopicFilter {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Topic creation parameters
 */
export interface CreateTopicParams {
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Topic update parameters
 */
export interface UpdateTopicParams {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Topic pagination metadata
 */
export interface TopicPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
