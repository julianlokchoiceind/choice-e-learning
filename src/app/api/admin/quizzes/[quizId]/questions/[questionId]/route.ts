/**
 * Individual Question API endpoint
 * Handles single question update and deletion (admin only)
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
  updateQuestion,
  deleteQuestion
} from '@/server/db/services/quiz-service';
import prisma from '@/server/db/prisma-client';

// PUT handler to update a question (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  const questionId = context.params.questionId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  if (!questionId) {
    return apiError('Question ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate update data with Zod
    const updateSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }).optional(),
      type: z.enum(['multiple_choice', 'true_false', 'short_answer']).optional(),
      content: z.string().min(1, { message: 'Question content is required' }).optional(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string().optional(),
      explanation: z.string().optional(),
      points: z.number().positive().optional(),
      order: z.number().optional()
    });
    
    const validation = updateSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid update data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if question exists and belongs to the quiz
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      return apiNotFound('Question');
    }
    
    if (existingQuestion.quizId !== quizId) {
      return apiError(
        'Question does not belong to this quiz',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    // Update the question
    const updatedQuestion = await updateQuestion(questionId, validation.data);
    
    if (!updatedQuestion) {
      return apiServerError('Failed to update question');
    }
    
    return apiSuccess(updatedQuestion, 'Question updated successfully');
  } catch (error: unknown) {
    console.error(`Error updating question ${questionId}:`, error);
    return apiServerError('Failed to update question');
  }
});

// DELETE handler to delete a question (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  const questionId = context.params.questionId;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  if (!questionId) {
    return apiError('Question ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    // Check if question exists and belongs to the quiz
    const existingQuestion = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!existingQuestion) {
      return apiNotFound('Question');
    }
    
    if (existingQuestion.quizId !== quizId) {
      return apiError(
        'Question does not belong to this quiz',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    // Delete the question
    const deletedQuestion = await deleteQuestion(questionId);
    
    if (!deletedQuestion) {
      return apiServerError('Failed to delete question');
    }
    
    return apiSuccess(null, 'Question deleted successfully');
  } catch (error: unknown) {
    console.error(`Error deleting question ${questionId}:`, error);
    return apiServerError('Failed to delete question');
  }
});