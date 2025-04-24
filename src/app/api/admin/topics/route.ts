/**
 * Admin Topics API endpoint
 * Handles fetching and managing topic information
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { topicService } from '@/lib/services/topics/topic-service';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { 
  withAdmin, 
  withErrorHandling 
} from '@/lib/api/route-handlers';
import { 
  parseQueryParams 
} from '@/lib/api/request-parser';

// Define the schema for query parameters
const topicQueryParamsSchema = z.object({
  page: z.string().optional().pipe(z.coerce.number().int().positive().default(1)),
  limit: z.string().optional().pipe(z.coerce.number().int().positive().default(10)),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  isActive: z.union([
    z.literal('true').transform(() => true),
    z.literal('false').transform(() => false),
    z.coerce.boolean().optional()
  ]).optional()
});

// Define the schema for topic creation
const createTopicSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

// GET handler to fetch topics
export const GET = withAdmin(async (req: NextRequest) => {
  // Parse query parameters
  const queryResult = parseQueryParams(req, topicQueryParamsSchema);
  
  if (!queryResult.success) {
    return queryResult.error;
  }
  
  try {
    // Get topics from service with pagination
    const result = await topicService.getAllTopics(queryResult.data);
    
    return apiSuccess(result.data, "Topics retrieved successfully", {
      pagination: {
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalItems: result.meta.total,
        totalPages: result.meta.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return apiServerError('Failed to fetch topics');
  }
});

// POST handler for creating topics (admin only)
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    
    // Validate topic data with Zod
    const validation = createTopicSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid topic data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Create the topic
    const newTopic = await topicService.createTopic(validation.data);
    
    return apiSuccess(newTopic, 'Topic created successfully', undefined, 201);
  } catch (error: any) {
    console.error('Error creating topic:', error);
    
    // Check for duplicate name error
    if (error.message && error.message.includes('already exists')) {
      return apiError(
        error.message,
        undefined,
        ApiErrorCode.DUPLICATE_ENTITY
      );
    }
    
    return apiServerError('Failed to create topic');
  }
});
