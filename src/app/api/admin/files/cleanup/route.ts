/**
 * Cleanup temporary files API endpoint
 * Removes temporary uploaded files that are no longer needed
 */

import { NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { withAdmin } from '@/server/api/route-handlers';
import { deleteFileByUrl } from '@/server/services/file/file-management-service';

// POST handler to cleanup temporary files (admin only)
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { urls } = body;
    
    if (!urls || !Array.isArray(urls)) {
      return apiError(
        'URLs array is required',
        undefined,
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    let cleanedCount = 0;
    const errors: string[] = [];
    
    // Process each URL
    for (const url of urls) {
      // Only process temp files for security
      if (url && typeof url === 'string' && url.includes('/uploads/temp/')) {
        try {
          // Use the file management service for deletion
          const deleted = await deleteFileByUrl(url);
          if (deleted) {
            cleanedCount++;
          } else {
            errors.push(url);
          }
        } catch (error) {
          // Log error but continue with other files
          console.error(`Failed to delete temp file ${url}:`, error);
          errors.push(url);
        }
      }
    }
    
    return apiSuccess({
      cleaned: cleanedCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    }, `Cleaned ${cleanedCount} temporary files`);
    
  } catch (error: unknown) {
    console.error('Error cleaning up temporary files:', error);
    return apiServerError('Failed to cleanup temporary files');
  }
});