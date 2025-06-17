/**
 * Individual Quiz API endpoint
 * Handles single quiz update and deletion (admin only)
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
  findQuizById,
  updateQuiz,
  deleteQuiz
} from '@/server/db/services/quiz-service';

// GET handler to fetch a single quiz (admin only)
export const GET = withAdmin(async (
  _req: NextRequest,
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const quiz = await findQuizById(quizId, true); // Include questions
    
    if (!quiz) {
      return apiNotFound('Quiz');
    }
    
    return apiSuccess(quiz);
  } catch (error: unknown) {
    console.error(`Error fetching quiz ${quizId}:`, error);
    return apiServerError('Failed to fetch quiz');
  }
});

// PUT handler to update a quiz (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate update data with Zod
    const updateSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }).optional(),
      description: z.string().optional(),
      timeLimit: z.number().positive().optional(),
      passingScore: z.number().min(0).max(100).optional(),
      maxAttempts: z.number().positive().optional(),
      order: z.number().optional(),
      isActive: z.boolean().optional()
    });
    
    const validation = updateSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid update data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if quiz exists
    const existingQuiz = await findQuizById(quizId);
    
    if (!existingQuiz) {
      return apiNotFound('Quiz');
    }
    
    // Update the quiz
    const updatedQuiz = await updateQuiz(quizId, validation.data);
    
    if (!updatedQuiz) {
      return apiServerError('Failed to update quiz');
    }
    
    return apiSuccess(updatedQuiz, 'Quiz updated successfully');
  } catch (error: unknown) {
    console.error(`Error updating quiz ${quizId}:`, error);
    return apiServerError('Failed to update quiz');
  }
});

// DELETE handler to delete a quiz (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    // Check if quiz exists
    const existingQuiz = await findQuizById(quizId);
    
    if (!existingQuiz) {
      return apiNotFound('Quiz');
    }
    
    // Delete the quiz
    const deletedQuiz = await deleteQuiz(quizId);
    
    if (!deletedQuiz) {
      return apiServerError('Failed to delete quiz');
    }
    
    return apiSuccess(null, 'Quiz deleted successfully');
  } catch (error: unknown) {
    console.error(`Error deleting quiz ${quizId}:`, error);
    return apiServerError('Failed to delete quiz');
  }
});