// src/app/api/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/auth-middleware';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  getLessonsByCourse, 
  createLesson, 
  updateLessonsOrder 
} from '@/server/services/lessons/lesson-service';
import { createLessonSchema } from '@/shared/schemas/lessons/lesson-schema';
import { UserRole } from '@/shared/types/auth/roles';

/**
 * GET /api/lessons
 * Lấy danh sách các bài học theo khóa học
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return apiError(ApiErrorCode.BAD_REQUEST, 'Thiếu tham số courseId');
    }
    
    const lessons = await getLessonsByCourse(courseId);
    return apiSuccess(lessons);
  } catch (error: any) {
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * POST /api/lessons
 * Tạo bài học mới
 */
async function createLessonHandler(
  request: NextRequest,
  { session }: { session: any }
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);
    
    const newLesson = await createLesson(validatedData);
    return apiSuccess(newLesson);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(ApiErrorCode.VALIDATION_ERROR, 'Dữ liệu không hợp lệ');
    }
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}

// Apply withAuth wrapper
export const POST = withAuth(createLessonHandler, { roles: [UserRole.ADMIN] });

/**
 * PATCH /api/lessons/order
 * Cập nhật thứ tự của các bài học
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { lessonIds } = body;
    
    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return apiError(ApiErrorCode.BAD_REQUEST, 'lessonIds phải là một mảng không rỗng');
    }
    
    await updateLessonsOrder(lessonIds);
    return apiSuccess({ success: true });
  } catch (error: any) {
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}
