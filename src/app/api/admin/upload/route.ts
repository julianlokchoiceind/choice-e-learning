/**
 * Admin File upload API endpoint
 * Handles file uploads for various parts of the application (admin only)
 */

import { NextRequest } from 'next/server';
import { uploadFile } from '@/server/services/file/file-upload-service';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  withErrorHandling, 
  withAdmin 
} from '@/server/api/route-handlers';

// Maximum file size allowed 
const MAX_FILE_SIZE_IMAGE = 2 * 1024 * 1024; // 2MB for images
const MAX_FILE_SIZE_DOCUMENT = 10 * 1024 * 1024; // 10MB for documents

// Allowed file types for images
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif'
];

// Allowed file types for course materials
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv'
];

// POST handler for file uploads (admin only)
export const POST = withAdmin(
  withErrorHandling(async (req: NextRequest) => {
    try {
      // Parse the multipart form data
      const formData = await req.formData();
      
      // Get the file from the form data
      const file = formData.get('file') as File | null;
      if (!file) {
        return apiError('No file provided', undefined, ApiErrorCode.VALIDATION_ERROR);
      }
      
      // Get upload type to determine validation rules
      const type = (formData.get('type') as string) || 'common';
      
      // Check if this is a temporary upload
      const isTemporary = formData.get('temporary') === 'true';
      
      // Validate file type and size based on upload type
      if (type === 'course-material' || type === 'lesson-material') {
        // Course/Lesson materials validation
        if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
          return apiError(
            'File type not allowed for course materials. Only PDF, DOC, XLS, PPT, ZIP files are allowed.',
            undefined, 
            ApiErrorCode.VALIDATION_ERROR
          );
        }
        
        if (file.size > MAX_FILE_SIZE_DOCUMENT) {
          return apiError(
            'File size exceeds limit of 10MB for course materials',
            undefined,
            ApiErrorCode.VALIDATION_ERROR
          );
        }
      } else {
        // Image uploads validation (existing logic)
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          return apiError(
            'File type not allowed. Only JPEG, PNG, and GIF are allowed.',
            undefined, 
            ApiErrorCode.VALIDATION_ERROR
          );
        }
        
        if (file.size > MAX_FILE_SIZE_IMAGE) {
          return apiError(
            'File size exceeds limit of 2MB',
            undefined,
            ApiErrorCode.VALIDATION_ERROR
          );
        }
      }
      
      // Get context from the form data
      const courseId = formData.get('courseId') as string | undefined;
      const lessonId = formData.get('lessonId') as string | undefined;
      const userId = formData.get('userId') as string | undefined;
      
      // Convert file to buffer for storage
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Upload the file
      const fileUrl = await uploadFile(buffer, file.name, {
        type: type as any,
        courseId,
        lessonId,
        userId,
        temporary: isTemporary
      });
      
      // Return the upload result
      return apiSuccess({ 
        url: fileUrl,
        temporary: isTemporary 
      }, 'File uploaded successfully');
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      return apiServerError('Failed to upload file');
    }
  })
); 