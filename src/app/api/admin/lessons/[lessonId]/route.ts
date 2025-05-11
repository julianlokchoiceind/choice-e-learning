import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  getLesson, 
  updateLesson, 
  deleteLesson 
} from '@/server/services/lessons/lesson-service';
import { updateLessonSchema } from '@/shared/schemas/lessons/lesson-schema';
import { 
  withAdmin,
  withErrorHandling,
  AuthenticatedContext
} from '@/server/api/route-handlers';

/**
 * GET /api/admin/lessons/[lessonId]
 * Lấy thông tin chi tiết của bài học (admin view)
 */
export const GET = withAdmin(async (
  _request: NextRequest,
  context: AuthenticatedContext
) => {
  try {
    const lessonId = context.params.lessonId;
    
    if (!lessonId) {
      return apiError('Thiếu ID bài học', undefined, ApiErrorCode.BAD_REQUEST);
    }
    
    const lesson = await getLesson(lessonId);
    
    if (!lesson) {
      return apiError('Bài học không tồn tại', undefined, ApiErrorCode.NOT_FOUND);
    }
    
    return apiSuccess(lesson);
  } catch (error: any) {
    console.error(`Error fetching lesson:`, error);
    return apiError(
      'Failed to fetch lesson',
      error instanceof Error ? error.message : undefined,
      error.code || ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * PUT /api/admin/lessons/[lessonId]
 * Cập nhật thông tin bài học (admin only)
 */
export const PUT = withAdmin(async (
  request: NextRequest,
  context: AuthenticatedContext
) => {
  try {
    const lessonId = context.params.lessonId;
    
    // Validate lesson ID
    if (!lessonId) {
      return apiError('Thiếu ID bài học', undefined, ApiErrorCode.BAD_REQUEST);
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = updateLessonSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Dữ liệu không hợp lệ',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    const validatedData = validation.data;
    
    // Đảm bảo dữ liệu không có null, chỉ có undefined để tương thích với Prisma
    const compatibleData = Object.fromEntries(
      Object.entries(validatedData).map(([key, value]) => {
        // Nếu giá trị là null, chuyển thành undefined
        return [key, value === null ? undefined : value];
      })
    );
    
    // Update lesson
    const updatedLesson = await updateLesson(lessonId, compatibleData);
    
    if (!updatedLesson) {
      return apiError('Bài học không tồn tại', undefined, ApiErrorCode.NOT_FOUND);
    }
    
    return apiSuccess(updatedLesson, 'Lesson updated successfully');
  } catch (error: any) {
    console.error(`Error updating lesson:`, error);
    if (error.name === 'ZodError') {
      return apiError(
        'Dữ liệu không hợp lệ',
        error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    return apiError(
      'Failed to update lesson',
      error instanceof Error ? error.message : undefined,
      error.code || ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

/**
 * DELETE /api/admin/lessons/[lessonId]
 * Xóa bài học (admin only)
 */
export const DELETE = withAdmin(async (
  _request: NextRequest,
  context: AuthenticatedContext
) => {
  try {
    const lessonId = context.params.lessonId;
    
    // Validate lesson ID
    if (!lessonId) {
      return apiError('Thiếu ID bài học', undefined, ApiErrorCode.BAD_REQUEST);
    }
    
    // Delete lesson
    const result = await deleteLesson(lessonId);
    
    if (!result) {
      return apiError('Bài học không tồn tại', undefined, ApiErrorCode.NOT_FOUND);
    }
    
    return apiSuccess({ success: true }, 'Lesson deleted successfully');
  } catch (error: any) {
    console.error(`Error deleting lesson:`, error);
    return apiError(
      'Failed to delete lesson',
      error instanceof Error ? error.message : undefined,
      error.code || ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}); 