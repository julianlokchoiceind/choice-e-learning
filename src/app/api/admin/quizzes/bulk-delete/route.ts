/**
 * Bulk delete quizzes API endpoint (admin only)
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
import prisma from '@/server/db/prisma-client';

// DELETE handler for bulk quiz deletion (admin only)
export const DELETE = withAdmin(async (
  req: NextRequest,
  _context: AuthenticatedContext
) => {
  try {
    const body = await req.json();
    
    // Validate request body
    const bulkDeleteSchema = z.object({
      ids: z.array(z.string().min(1)).min(1, { message: 'At least one ID is required' })
    });
    
    const validation = bulkDeleteSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid request data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    const { ids } = validation.data;
    
    // Check if all quizzes exist
    const existingQuizzes = await prisma.quiz.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true }
    });
    
    if (existingQuizzes.length !== ids.length) {
      const foundIds = existingQuizzes.map(q => q.id);
      const missingIds = ids.filter(id => !foundIds.includes(id));
      
      return apiError(
        `Some quizzes not found: ${missingIds.join(', ')}`,
        { missingIds },
        ApiErrorCode.NOT_FOUND
      );
    }
    
    // Perform bulk deletion
    const deleteResult = await prisma.quiz.deleteMany({
      where: { id: { in: ids } }
    });
    
    return apiSuccess(
      { 
        deletedCount: deleteResult.count,
        deletedQuizzes: existingQuizzes
      }, 
      `Successfully deleted ${deleteResult.count} quiz(es)`
    );
  } catch (error: unknown) {
    console.error('Error in bulk quiz deletion:', error);
    return apiServerError('Failed to delete quizzes');
  }
});