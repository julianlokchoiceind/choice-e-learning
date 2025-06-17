/**
 * Lesson Materials API endpoint
 * Handles lesson materials CRUD operations (admin only)
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
  findLessonMaterialsByLessonId,
  createLessonMaterial
} from '@/server/db/services/course-service';

// GET handler to fetch lesson materials (admin only)
export const GET = withAdmin(async (
  _req: NextRequest,
  context: AuthenticatedContext) => {
  const lessonId = context.params.lessonId;
  
  if (!lessonId) {
    return apiError('Lesson ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const materials = await findLessonMaterialsByLessonId(lessonId);
    
    return apiSuccess(materials);
  } catch (error: unknown) {
    console.error(`Error fetching lesson materials for lesson ${lessonId}:`, error);
    return apiServerError('Failed to fetch lesson materials');
  }
});

// POST handler to create a new lesson material (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext) => {
  const lessonId = context.params.lessonId;
  
  if (!lessonId) {
    return apiError('Lesson ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate lesson material data with Zod
    const materialSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      fileName: z.string().min(1, { message: 'File name is required' }),
      fileSize: z.number().positive({ message: 'File size must be positive' }),
      fileType: z.string().min(1, { message: 'File type is required' }),
      mimeType: z.string().min(1, { message: 'MIME type is required' }),
      description: z.string().optional().default('Lesson Material'),
      url: z.string().min(1, { message: 'File URL is required' })
    });
    
    const validation = materialSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Lesson material validation failed:', validation.error.format());
      return apiError(
        'Invalid lesson material data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Create the lesson material
    const material = await createLessonMaterial(lessonId, validation.data);
    
    if (!material) {
      return apiServerError('Failed to create lesson material');
    }
    
    return apiSuccess(material, 'Lesson material created successfully');
  } catch (error: unknown) {
    console.error(`Error creating lesson material for lesson ${lessonId}:`, error);
    return apiServerError('Failed to create lesson material');
  }
});