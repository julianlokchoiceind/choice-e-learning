/**
 * Individual Course Material API endpoint
 * Handles single course material update and deletion (admin only)
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
  updateCourseMaterial,
  deleteCourseMaterial
} from '@/server/db/services/course-service';
import prisma from '@/server/db/prisma-client';

// PUT handler to update a course material (admin only)
export const PUT = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  const materialId = context.params.materialId;
  
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  if (!materialId) {
    return apiError('Material ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate update data with Zod
    const updateSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }).optional(),
      description: z.string().optional(),
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
    
    // Check if material exists and belongs to the course
    const existingMaterial = await prisma.courseMaterial.findUnique({
      where: { id: materialId }
    });
    
    if (!existingMaterial) {
      return apiNotFound('Course material');
    }
    
    if (existingMaterial.courseId !== courseId) {
      return apiError(
        'Material does not belong to this course',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    // Update the material
    const updatedMaterial = await updateCourseMaterial(materialId, validation.data);
    
    if (!updatedMaterial) {
      return apiServerError('Failed to update course material');
    }
    
    return apiSuccess(updatedMaterial, 'Course material updated successfully');
  } catch (error: unknown) {
    console.error(`Error updating course material ${materialId}:`, error);
    return apiServerError('Failed to update course material');
  }
});

// DELETE handler to delete a course material (admin only)
export const DELETE = withAdmin(async (
  _req: NextRequest, 
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  const materialId = context.params.materialId;
  
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  if (!materialId) {
    return apiError('Material ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    // Check if material exists and belongs to the course
    const existingMaterial = await prisma.courseMaterial.findUnique({
      where: { id: materialId }
    });
    
    if (!existingMaterial) {
      return apiNotFound('Course material');
    }
    
    if (existingMaterial.courseId !== courseId) {
      return apiError(
        'Material does not belong to this course',
        {},
        ApiErrorCode.UNAUTHORIZED
      );
    }
    
    // Delete the material
    const deletedMaterial = await deleteCourseMaterial(materialId);
    
    if (!deletedMaterial) {
      return apiServerError('Failed to delete course material');
    }
    
    return apiSuccess(null, 'Course material deleted successfully');
  } catch (error: unknown) {
    console.error(`Error deleting course material ${materialId}:`, error);
    return apiServerError('Failed to delete course material');
  }
});