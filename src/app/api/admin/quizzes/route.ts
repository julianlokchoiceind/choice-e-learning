/**
 * Quizzes API endpoint
 * Handles quiz CRUD operations (admin only)
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  withErrorHandling, 
  withAdmin,
  AuthenticatedContext
} from '@/server/api/route-handlers';
import { 
  findQuizzes,
  createQuiz
} from '@/server/db/services/quiz-service';

// GET handler to fetch quizzes (admin only)
export const GET = withAdmin(async (
  req: NextRequest,
  _context: AuthenticatedContext
) => {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId') || undefined;
    
    const quizzes = await findQuizzes(courseId);
    
    return apiSuccess(quizzes);
  } catch (error: unknown) {
    console.error('Error fetching quizzes:', error);
    return apiServerError('Failed to fetch quizzes');
  }
});

// POST handler to create a new quiz (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  _context: AuthenticatedContext
) => {
  try {
    const body = await req.json();
    
    // Validate quiz data with Zod
    const quizSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      description: z.string().optional(),
      courseId: z.string().min(1, { message: 'Course ID is required' }),
      timeLimit: z.number().positive().optional(),
      passingScore: z.number().min(0).max(100).optional(),
      maxAttempts: z.number().positive().optional(),
      order: z.number().optional()
    });
    
    const validation = quizSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Quiz validation failed:', validation.error.format());
      return apiError(
        'Invalid quiz data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Create the quiz
    const quiz = await createQuiz(validation.data);
    
    if (!quiz) {
      return apiServerError('Failed to create quiz');
    }
    
    return apiSuccess(quiz, 'Quiz created successfully');
  } catch (error: unknown) {
    console.error('Error creating quiz:', error);
    return apiServerError('Failed to create quiz');
  }
});