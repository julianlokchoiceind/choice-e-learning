import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin,
  AuthenticatedContext
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

// GET handler to fetch all lessons for a course (admin view)
export const GET = withAdmin(async (
  _req: NextRequest,
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const lessons = await getLessonsForCourse(courseId);
    return apiSuccess(lessons);
  } catch (error: unknown) {
    console.error(`Error fetching lessons for course ${courseId}:`, error);
    return apiServerError('Failed to fetch lessons');
  }
});

// POST handler to create a new lesson (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  
  // Check if courseId is defined
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
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
    
    // Tạo lesson với data structure đúng cho createLesson function
    const newLesson = await createLesson({
      title: lessonData.title,
      content: lessonData.content || '',
      videoUrl: lessonData.videoUrl || null,
      duration: lessonData.duration || null,
      resourcesData: lessonData.resourcesData || null,
      order: lessonData.order || 0, // Let createLesson handle order calculation
      courseId: courseId,
      chapterId: chapterId || null
    });
    
    if (!newLesson) {
      return apiServerError('Failed to create lesson');
    }
    
    return apiSuccess(newLesson, 'Lesson created successfully');
  } catch (error: unknown) {
    console.error(`Error creating lesson for course ${courseId}:`, error);
    return apiServerError('Failed to create lesson');
  }
}); 