/**
 * File upload API endpoint
 * Handles file uploads for various parts of the application
 */

import { NextRequest } from 'next/server';
import { uploadFile } from '@/lib/services/file/file-upload-service';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { 
  withErrorHandling, 
  withAdmin 
} from '@/lib/api/route-handlers';

// Maximum file size allowed (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed file types for images
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif'
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
      
      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return apiError(
          'File type not allowed. Only JPEG, PNG, and GIF are allowed.',
          undefined, 
          ApiErrorCode.VALIDATION_ERROR
        );
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return apiError(
          'File size exceeds limit of 2MB',
          undefined,
          ApiErrorCode.VALIDATION_ERROR
        );
      }
      
      // Get upload type and context from the form data
      const type = (formData.get('type') as string) || 'common';
      const courseId = formData.get('courseId') as string | undefined;
      const userId = formData.get('userId') as string | undefined;
      
      // Convert file to buffer for storage
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Upload the file
      const fileUrl = await uploadFile(buffer, file.name, {
        type: type as any,
        courseId,
        userId
      });
      
      // Return the upload result
      return apiSuccess({ url: fileUrl }, 'File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      return apiServerError('Failed to upload file');
    }
  })
);
