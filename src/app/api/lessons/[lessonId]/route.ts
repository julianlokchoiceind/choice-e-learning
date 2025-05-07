// src/app/api/lessons/[lessonId]/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/server/auth/auth-middleware';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { 
  getLesson, 
  updateLesson, 
  deleteLesson 
} from '@/server/services/lessons/lesson-service';
import { updateLessonSchema } from '@/shared/schemas/lessons/lesson-schema';

/**
 * GET /api/lessons/[lessonId]
 * Lấy thông tin chi tiết của bài học
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) => {
  try {
    const lesson = await getLesson(params.lessonId);
    return apiSuccess(lesson);
  } catch (error) {
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
};

/**
 * PUT /api/lessons/[lessonId]
 * Cập nhật thông tin bài học
 */
export const PUT = withAuth(async (
  request: NextRequest,
  { params, session }: { params: { lessonId: string }, session: any }
) => {
  try {
    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);
    
    const updatedLesson = await updateLesson(params.lessonId, validatedData);
    return apiSuccess(updatedLesson);
  } catch (error) {
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: error.errors });
    }
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
}, { roles: ['ADMIN', 'INSTRUCTOR'] });

/**
 * DELETE /api/lessons/[lessonId]
 * Xóa bài học
 */
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) => {
  try {
    await deleteLesson(params.lessonId);
    return apiSuccess({ success: true });
  } catch (error) {
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
}, { roles: ['ADMIN'] });
