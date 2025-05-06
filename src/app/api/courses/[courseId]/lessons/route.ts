import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-error-codes';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin 
} from '@/server/api/route-handlers';
import { 
  getLessonsForCourse,
  createLesson
} from '@/server/db/services/lesson-service';

// Define path parameters
type CourseLessonsParams = {
  params: {
    courseId: string;
  };
};

// GET handler to fetch all lessons for a course
export const GET = withErrorHandling(async (
  _req: NextRequest,
  context: any
) => {
  const { courseId } = context.params;
  
  try {
    const lessons = await getLessonsForCourse(courseId);
    return apiSuccess(lessons);
  } catch (error) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    return apiServerError('Failed to fetch lessons');
  }
});

// POST handler to create a new lesson (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  context: any
) => {
  const { courseId } = context.params;
  
  try {
    const body = await req.json();
    
    // Validate lesson data with Zod
    const lessonSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      content: z.string().min(1, { message: 'Content is required' }),
      videoUrl: z.string().url().optional().nullable(),
      duration: z.string().optional(),
      resourcesData: z.string().optional(),
      order: z.number().optional(),
      chapterId: z.string().optional().nullable()
    });
    
    const validation = lessonSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid lesson data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    const { chapterId, ...lessonData } = validation.data;
    
    // Trước khi gọi createLesson, tìm order tiếp theo
    let orderValue = lessonData.order;
    if (!orderValue) {
      const existingLessons = await getLessonsForCourse(courseId);
      orderValue = existingLessons.length > 0 
        ? Math.max(...existingLessons.map(l => l.order)) + 1 
        : 1;
    }
    
    // Tạo lesson với order đã được xác định
    const newLesson = await createLesson({
      ...lessonData,
      order: orderValue,
      course: {
        connect: { id: courseId }
      },
      ...(chapterId && {
        chapter: {
          connect: { id: chapterId }
        }
      })
    });
    
    if (!newLesson) {
      return apiServerError('Failed to create lesson');
    }
    
    return apiSuccess(newLesson, 'Lesson created successfully');
  } catch (error) {
    console.error(`Error creating lesson for course ${courseId}:`, error);
    return apiServerError('Failed to create lesson');
  }
}); 