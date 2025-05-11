import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  getLessonsByCourse, 
  createLesson, 
  updateLessonsOrder 
} from '@/server/services/lessons/lesson-service';
import { createLessonSchema } from '@/shared/schemas/lessons/lesson-schema';
import { 
  withAdmin,
  withErrorHandling,
  AuthenticatedContext
} from '@/server/api/route-handlers';

/**
 * GET /api/admin/lessons
 * Lấy danh sách các bài học theo khóa học (admin view)
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return apiError('Thiếu tham số courseId', undefined, ApiErrorCode.BAD_REQUEST);
    }
    
    const lessons = await getLessonsByCourse(courseId);
    return apiSuccess(lessons);
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
 * POST /api/admin/lessons
 * Tạo bài học mới (admin only)
 */
export const POST = withAdmin(async (request: NextRequest, context: AuthenticatedContext) => {
  try {
    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);
    
    const newLesson = await createLesson(validatedData);
    return apiSuccess(newLesson, 'Lesson created successfully', undefined, 201);
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    if (error.name === 'ZodError') {
      return apiError(
        'Dữ liệu không hợp lệ',
        error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    return apiError(
      'Failed to create lesson',
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