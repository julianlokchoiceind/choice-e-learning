// src/app/api/lessons/[lessonId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/auth-middleware';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  getLesson, 
  updateLesson, 
  deleteLesson 
} from '@/server/services/lessons/lesson-service';
import { updateLessonSchema } from '@/shared/schemas/lessons/lesson-schema';
import { UserRole } from '@/shared/types/auth/roles';

/**
 * GET /api/lessons/[lessonId]
 * Lấy thông tin chi tiết của bài học
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
): Promise<NextResponse> {
  try {
    const lesson = await getLesson(params.lessonId);
    return apiSuccess(lesson);
  } catch (error: any) {
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * PUT /api/lessons/[lessonId]
 * Cập nhật thông tin bài học
 */
async function updateLessonHandler(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
): Promise<NextResponse> {
  try {
    // Validate lesson ID
    const lessonId = params.lessonId;
    if (!lessonId) {
      return apiError(ApiErrorCode.BAD_REQUEST, 'Thiếu ID bài học');
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validation = updateLessonSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(ApiErrorCode.VALIDATION_ERROR, 'Dữ liệu không hợp lệ');
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
    return apiSuccess(updatedLesson);
    
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError(ApiErrorCode.VALIDATION_ERROR, 'Dữ liệu không hợp lệ');
    }
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}

// Apply auth middleware
export const PUT = withAuth(updateLessonHandler, { roles: [UserRole.ADMIN] });

/**
 * DELETE /api/lessons/[lessonId]
 * Xóa bài học
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
): Promise<NextResponse> {
  try {
    // Validate lesson ID
    const lessonId = params.lessonId;
    if (!lessonId) {
      return apiError(ApiErrorCode.BAD_REQUEST, 'Thiếu ID bài học');
    }
    
    // Delete lesson
    await deleteLesson(lessonId);
    return apiSuccess({ success: true });
  } catch (error: any) {
    return apiError(error.code || ApiErrorCode.INTERNAL_SERVER_ERROR, error.message);
  }
}