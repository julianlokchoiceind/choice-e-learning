// src/app/api/lessons/route.ts
import { NextRequest } from 'next/server';
import { withAuth } from '@/server/auth/auth-middleware';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { 
  getLessonsByCourse, 
  createLesson, 
  updateLessonsOrder 
} from '@/server/services/lessons/lesson-service';
import { createLessonSchema } from '@/shared/schemas/lessons/lesson-schema';

/**
 * GET /api/lessons
 * Lấy danh sách các bài học theo khóa học
 */
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return apiError('BAD_REQUEST', 'Thiếu tham số courseId');
    }
    
    const lessons = await getLessonsByCourse(courseId);
    return apiSuccess(lessons);
  } catch (error) {
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
};

/**
 * POST /api/lessons
 * Tạo bài học mới
 */
export const POST = withAuth(async (
  request: NextRequest,
  { session }: { session: any }
) => {
  try {
    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);
    
    const newLesson = await createLesson(validatedData);
    return apiSuccess(newLesson);
  } catch (error) {
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', 'Dữ liệu không hợp lệ', { errors: error.errors });
    }
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
}, { roles: ['ADMIN', 'INSTRUCTOR'] });

/**
 * PATCH /api/lessons/order
 * Cập nhật thứ tự của các bài học
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonIds } = body;
    
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return apiError('BAD_REQUEST', 'lessonIds phải là một mảng không rỗng');
    }
    
    await updateLessonsOrder(lessonIds);
    return apiSuccess({ success: true });
  } catch (error) {
    return apiError(error.code || 'INTERNAL_SERVER_ERROR', error.message);
  }
}
