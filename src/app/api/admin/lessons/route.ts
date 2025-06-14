import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  getLessons,
  getLessonsByCourse, 
  updateLessonsOrder 
} from '@/server/services/lessons/lesson-service';
import { 
  withAdmin,
  withErrorHandling,
  AuthenticatedContext
} from '@/server/api/route-handlers';

/**
 * GET /api/admin/lessons
 * Get lessons with optional filtering (admin view)
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc';
    
    // If courseId is provided without other filters, use the old method for backward compatibility
    if (courseId && !search && !status && page === 1 && limit === 10 && sortBy === 'createdAt') {
      const lessons = await getLessonsByCourse(courseId);
      return apiSuccess(lessons);
    }
    
    // Use the new method with full filtering support
    const result = await getLessons({
      page,
      limit,
      courseId: courseId || undefined,
      search,
      status,
      sortBy,
      sortOrder
    });
    
    return apiSuccess(result.data, undefined, result.meta);
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return apiError(
      'Failed to fetch lessons',
      error instanceof Error ? error.message : undefined,
      error.code || ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * PATCH /api/admin/lessons/order
 * Cập nhật thứ tự của các bài học (admin only)
 */
export const PATCH = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { lessonIds } = body;
    
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return apiError(
        'lessonIds phải là một mảng không rỗng',
        undefined,
        ApiErrorCode.BAD_REQUEST
      );
    }
    
    await updateLessonsOrder(lessonIds);
    return apiSuccess({ success: true }, 'Lesson order updated successfully');
  } catch (error: any) {
    console.error('Error updating lesson order:', error);
    return apiError(
      'Failed to update lesson order',
      error instanceof Error ? error.message : undefined,
      error.code || ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}); 