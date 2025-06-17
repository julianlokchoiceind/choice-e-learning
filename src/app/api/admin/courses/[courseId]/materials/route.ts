/**
 * Course Materials API endpoint
 * Handles course materials CRUD operations (admin only)
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
  findCourseMaterialsByCourseId,
  createCourseMaterial
} from '@/server/db/services/course-service';

// GET handler to fetch course materials (admin only)
export const GET = withAdmin(async (
  _req: NextRequest,
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const materials = await findCourseMaterialsByCourseId(courseId);
    
    return apiSuccess(materials);
  } catch (error: unknown) {
    console.error(`Error fetching course materials for course ${courseId}:`, error);
    return apiServerError('Failed to fetch course materials');
  }
});

// POST handler to create a new course material (admin only)
export const POST = withAdmin(async (
  req: NextRequest, 
  context: AuthenticatedContext) => {
  const courseId = context.params.courseId;
  
  if (!courseId) {
    return apiError('Course ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate course material data with Zod
    const materialSchema = z.object({
      title: z.string().min(1, { message: 'Title is required' }),
      fileName: z.string().min(1, { message: 'File name is required' }),
      fileSize: z.number().positive({ message: 'File size must be positive' }),
      fileType: z.string().min(1, { message: 'File type is required' }),
      mimeType: z.string().min(1, { message: 'MIME type is required' }),
      description: z.string().optional().default('Course Material'),
      url: z.string().min(1, { message: 'File URL is required' })
    });
    
    const validation = materialSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Course material validation failed:', validation.error.format());
      return apiError(
        'Invalid course material data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Create the course material
    const material = await createCourseMaterial(courseId, validation.data);
    
    if (!material) {
      return apiServerError('Failed to create course material');
    }
    
    return apiSuccess(material, 'Course material created successfully');
  } catch (error: unknown) {
    console.error(`Error creating course material for course ${courseId}:`, error);
    return apiServerError('Failed to create course material');
  }
});