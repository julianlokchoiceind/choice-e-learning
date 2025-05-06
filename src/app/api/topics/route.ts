/**
 * Public Topics API endpoint
 * Provides access to topic data for frontend
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { topicService } from '@/server/services/topics/topic-service';
import { 
  apiSuccess, 
  apiServerError
} from '@/server/api/api-response';
import { withErrorHandling } from '@/server/api/route-handlers';
import { parseQueryParams } from '@/server/api/request-parser';

// Define the schema for query parameters
const topicQueryParamsSchema = z.object({
  page: z.string().optional().pipe(z.coerce.number().int().positive().default(1)),
  limit: z.string().optional().pipe(z.coerce.number().int().positive().default(10)),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z.string().optional().pipe(z.coerce.boolean().optional().default(true))
});

// GET handler to fetch topics
export const GET = withErrorHandling(async (req: NextRequest) => {
  try {
    // Check for parameters
    const hasParams = req.url.includes('?');
    
    // If there are no query parameters, return all active topics (simple mode)
    if (!hasParams) {
      const topics = await topicService.getAllActiveTopics();
      return apiSuccess(topics, 'Topics retrieved successfully');
    }
    
    // Otherwise, parse query parameters for advanced filtering
    const queryResult = parseQueryParams(req, topicQueryParamsSchema);
    if (!queryResult.success) {
      return queryResult.error;
    }
    
    // Always enforce isActive=true for public API regardless of what was requested
    const publicQueryParams = {
      ...queryResult.data,
      isActive: true
    };
    
    // Get topics from service with pagination
    const result = await topicService.getAllTopics(publicQueryParams);
    
    return apiSuccess(result.data, "Topics retrieved successfully", {
      pagination: {
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalItems: result.meta.total,
        totalPages: result.meta.totalPages,
        hasNextPage: result.meta.page < result.meta.totalPages,
        hasPrevPage: result.meta.page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public topics:', error);
    return apiServerError('Failed to fetch topics');
  }
});
