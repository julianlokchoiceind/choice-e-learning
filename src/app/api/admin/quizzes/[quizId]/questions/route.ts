/**
 * Quiz Questions API endpoint
 * Handles question CRUD operations for a specific quiz (admin only)
 */

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
  withErrorHandling, 
  withAdmin,
  AuthenticatedContext
} from '@/server/api/route-handlers';
import { 
  findQuizQuestions,
  createQuestion,
  findQuizById
} from '@/server/db/services/quiz-service';

// GET handler to fetch quiz questions (admin only)
export const GET = withAdmin(async (
  _req: NextRequest,
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const questions = await findQuizQuestions(quizId);
    
    return apiSuccess(questions);
  } catch (error: unknown) {
    console.error(`Error fetching questions for quiz ${quizId}:`, error);
    return apiServerError('Failed to fetch questions');
  }
});

// POST handler to create a new question (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate question data with Zod
    const questionSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      type: z.enum(['multiple_choice', 'true_false', 'short_answer'], {
        message: 'Invalid question type'
      }),
      content: z.string().min(1, { message: 'Question content is required' }),
      options: z.array(z.string()).min(1, { message: 'At least one option is required' }),
      correctAnswer: z.string().min(1, { message: 'Correct answer is required' }),
      explanation: z.string().optional(),
      points: z.number().positive().optional(),
      order: z.number().optional()
    });
    
    const validation = questionSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Question validation failed:', validation.error.format());
      return apiError(
        'Invalid question data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if quiz exists
    const quiz = await findQuizById(quizId);
    if (!quiz) {
      return apiNotFound('Quiz');
    }
    
    // Create the question
    const question = await createQuestion({
      ...validation.data,
      quizId
    });
    
    if (!question) {
      return apiServerError('Failed to create question');
    }
    
    return apiSuccess(question, 'Question created successfully');
  } catch (error: unknown) {
    console.error(`Error creating question for quiz ${quizId}:`, error);
    return apiServerError('Failed to create question');
  }
});