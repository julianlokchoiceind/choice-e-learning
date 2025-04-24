import { Topic as PrismaTopic } from '@prisma/client';

/**
 * Extended Topic interface with count relations
 */
export interface Topic extends PrismaTopic {
  _count?: {
    courses?: number;
  };
}

/**
 * Topic filter parameters for querying
 */
export interface TopicFilter {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
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
