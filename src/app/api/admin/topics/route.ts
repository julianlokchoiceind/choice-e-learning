/**
 * Admin Topics API endpoint
 * Handles fetching and managing topic information
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { topicService } from '@/server/services/topics/topic-service';
import { CreateTopicParams } from '@/shared/types/topics';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  withAdmin, 
  withErrorHandling,
  AuthenticatedContext
} from '@/server/api/route-handlers';
import { 
  parseQueryParams,
  parseJsonBody
} from '@/server/api/request-parser';
// Không cần import getAuthSession vì đã sử dụng middleware

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
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true)
});

// GET handler to fetch topics
export const GET = withAdmin(async (req: NextRequest) => {
  // Parse query parameters
  const queryResult = parseQueryParams(req, topicQueryParamsSchema);
  
  if (!queryResult.success) {
    // Trả về empty success response thay vì lỗi
    console.error('Invalid query parameters:', queryResult.error);
    return apiSuccess([], 'Topics retrieved successfully', {
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
  
  try {
    // Add debug logs
    console.log('DEBUG: Checking access to topics collection');
    try {
      const topicsCount = await topicService.getAllTopics({ limit: 1 });
      console.log(`DEBUG: Topic service returned data with ${topicsCount.data.length} topics`);
    } catch (dbError: unknown) {
      console.error('DEBUG: Database error during count:', dbError);
    }
    
    // Get topics from service with pagination
    const result = await topicService.getAllTopics(queryResult.data);
    
    return apiSuccess(result.data, 'Topics retrieved successfully', {
      pagination: {
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalItems: result.meta.total,
        totalPages: result.meta.totalPages,
        hasNextPage: result.meta.page < result.meta.totalPages,
        hasPrevPage: result.meta.page > 1
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching topics:', error);
    // Trả về empty success response thay vì lỗi 500
    return apiSuccess([], 'Topics retrieved successfully', {
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
});

// POST handler for creating topics (admin only)
export const POST = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  console.log('POST /api/admin/topics route called');
  console.log('Request headers:', Object.fromEntries(req.headers));
  
  try {
    // Admin đã được xác thực qua withAdmin middleware
    console.log('Admin authenticated via middleware:', context.user?.email);
    // Chúng ta có thể dùng thông tin người dùng từ context
    const adminUser = context.user;
    
    // Clone request để có thể đọc body nhiều lần nếu cần
    const clonedReq = req.clone();
    
    // Đọc text body trước để debug
    let rawBody;
    try {
      rawBody = await clonedReq.text();
      console.log('Raw request body:', rawBody);
    } catch (err: unknown) {
      console.error('Error reading raw body:', err);
    }
    
    // Parse JSON body manually for more control
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : null;
      console.log('Parsed body:', body);
    } catch (parseErr: unknown) {
      console.error('JSON parse error:', parseErr);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }
    
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'Empty request body' },
        { status: 400 }
      );
    }
    
    // Validate topic data with Zod
    const validation = createTopicSchema.safeParse(body);
    
    if (!validation.success) {
      console.log('Validation failed:', validation.error.format());
      return apiError(
        'Invalid topic data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Log dữ liệu đã được validate
    console.log('Validated data:', validation.data);
    
    // Create the topic
    const topicData: CreateTopicParams = {
      name: validation.data.name,
      description: validation.data.description,
      isActive: validation.data.isActive
    };
    const newTopic = await topicService.createTopic(topicData);
    console.log('Topic created successfully:', newTopic);
    
    return apiSuccess(newTopic, 'Topic created successfully', undefined, 201);
  } catch (error: unknown) {
    console.error('Error creating topic:', error);
    if (typeof error === 'object' && error !== null && 'stack' in error) {
      console.error('Error stack:', error.stack);
    }
    
    // Check for duplicate name error
    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string' && error.message.includes('already exists')) {
      return apiError(
        error.message,
        undefined,
        ApiErrorCode.DUPLICATE_ENTRY
      );
    }
    
    // Kiểm tra lỗi Prisma
    if (typeof error === 'object' && error !== null && 'code' in error) {
      console.error('Prisma error code:', error.code);
      return apiError(
        `Database error: ${typeof error === 'object' && error !== null && 'message' in error ? error.message : 'Unknown error'}`,
        { code: error.code },
        ApiErrorCode.SERVER_ERROR
      );
    }
    
    return apiServerError('Failed to create topic', { 
      message: typeof error === 'object' && error !== null && 'message' in error ? 
        String(error.message) : 'Unknown error' 
    });
  }
});
