import { NextRequest } from 'next/server';
import { withErrorHandling } from '@/lib/api/route-handlers';
import { getAllTopics } from '@/lib/services/courses/course-service';
import { apiSuccess, apiError } from '@/lib/api/api-response';

/**
 * GET endpoint to retrieve all unique topics from courses
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  try {
    const topics = await getAllTopics();
    
    return apiSuccess(
      { topics },
      'Topics retrieved successfully'
    );
  } catch (error: any) {
    console.error('Error in GET /api/courses/topics:', error);
    return apiError({
      code: 'internal_server_error',
      message: 'Failed to retrieve topics',
      error: error.message
    });
  }
});
