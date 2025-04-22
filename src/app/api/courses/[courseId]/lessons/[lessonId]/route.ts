import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { 
  createRouteHandler, 
  withErrorHandling, 
  withAdmin 
} from '@/lib/api/route-handlers';
import { 
  findLessonById,
  updateLesson,
  deleteLesson
} from '@/lib/db/services/lesson-service';

// Define path parameters
type LessonDetailParams = {
  params: {
    courseId: string;
    lessonId: string;
  };
};

// GET handler to fetch a specific lesson
export const GET = withErrorHandling(async (
  _req: NextRequest,
  context: any
) => {
  const { lessonId } = context.params;
  
  try {
    const lesson = await findLessonById(lessonId, true);
    
    if (!lesson) {
      return apiNotFound('Lesson');
    }
    
    return apiSuccess(lesson);
  } catch (error) {
    console.error(`Error fetching lesson ${lessonId}:`, error);
    return apiServerError('Failed to fetch lesson details');
  }
});

// PUT handler to update a lesson (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: any
) => {
  const { lessonId, courseId } = context.params;
  
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
    
    // Check if lesson exists
    const existingLesson = await findLessonById(lessonId);
    
    if (!existingLesson) {
      return apiNotFound('Lesson');
    }
    
    // Verify that lesson belongs to the course
    if (existingLesson.courseId !== courseId) {
      return apiError(
        'Lesson does not belong to this course',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    const { chapterId, ...lessonData } = validation.data;
    
    // Update the lesson
    const updatedLesson = await updateLesson(lessonId, {
      ...lessonData,
      ...(chapterId && {
        chapter: {
          connect: { id: chapterId }
        }
      })
    });
    
    if (!updatedLesson) {
      return apiServerError('Failed to update lesson');
    }
    
    return apiSuccess(updatedLesson, 'Lesson updated successfully');
  } catch (error) {
    console.error(`Error updating lesson ${lessonId}:`, error);
    return apiServerError('Failed to update lesson');
  }
});

// DELETE handler to delete a lesson (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: any
) => {
  const { lessonId, courseId } = context.params;
  
  try {
    // Check if lesson exists
    const existingLesson = await findLessonById(lessonId);
    
    if (!existingLesson) {
      return apiNotFound('Lesson');
    }
    
    // Verify that lesson belongs to the course
    if (existingLesson.courseId !== courseId) {
      return apiError(
        'Lesson does not belong to this course',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    // Delete the lesson
    const deletedLesson = await deleteLesson(lessonId);
    
    if (!deletedLesson) {
      return apiServerError('Failed to delete lesson');
    }
    
    return apiSuccess(null, 'Lesson deleted successfully');
  } catch (error) {
    console.error(`Error deleting lesson ${lessonId}:`, error);
    return apiServerError('Failed to delete lesson');
  }
}); 