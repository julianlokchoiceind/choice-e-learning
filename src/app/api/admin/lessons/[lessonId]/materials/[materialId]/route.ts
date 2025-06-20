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
  findLessonMaterialById,
  deleteLessonMaterial
} from '@/server/services/lessons/lesson-service';

/**
 * DELETE /api/admin/lessons/[lessonId]/materials/[materialId]
 * Delete a lesson material
 */
export const DELETE = withAdmin(async (
  req: NextRequest,
  context: AuthenticatedContext
) => {
  const { lessonId, materialId } = context.params;
  
  if (!lessonId || !materialId) {
    return apiError('Lesson ID and Material ID are required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    // Get the material to retrieve file URL before deletion
    const existingMaterial = await findLessonMaterialById(materialId);
    
    if (!existingMaterial) {
      return apiNotFound('Lesson material not found');
    }
    
    // Delete the material from database (this also handles file deletion)
    await deleteLessonMaterial(materialId);
    
    return apiSuccess(null, 'Lesson material deleted successfully');
  } catch (error: unknown) {
    console.error(`Error deleting lesson material ${materialId}:`, error);
    return apiServerError('Failed to delete lesson material');
  }
});