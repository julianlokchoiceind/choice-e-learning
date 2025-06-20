/**
 * Scheduled cleanup for old temporary files
 * This endpoint should be called periodically (e.g., via cron job) to clean up old temp files
 */

import { NextRequest } from 'next/server';
import { 
  apiSuccess, 
  apiServerError,
  apiError
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { withAdmin } from '@/server/api/route-handlers';
import { cleanupOldTempFiles } from '@/server/services/file/file-management-service';

// POST handler for scheduled cleanup (admin only)
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    // Get hours parameter from request (default to 24 hours)
    const body = await req.json().catch(() => ({}));
    const hoursOld = body.hoursOld || 24;
    
    // Validate hours parameter
    if (typeof hoursOld !== 'number' || hoursOld < 1 || hoursOld > 168) {
      return apiError(
        'Invalid hoursOld parameter. Must be between 1 and 168 (1 week)',
        undefined,
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    console.log(`Starting scheduled cleanup for temp files older than ${hoursOld} hours...`);
    
    // Perform cleanup
    const cleanedCount = await cleanupOldTempFiles(hoursOld);
    
    console.log(`Scheduled cleanup completed. Cleaned ${cleanedCount} files.`);
    
    return apiSuccess({
      cleaned: cleanedCount,
      hoursOld
    }, `Cleaned ${cleanedCount} temporary files older than ${hoursOld} hours`);
    
  } catch (error: unknown) {
    console.error('Error in scheduled cleanup:', error);
    return apiServerError('Failed to perform scheduled cleanup');
  }
});

// GET handler to check cleanup status (admin only)
export const GET = withAdmin(async (_req: NextRequest) => {
  return apiSuccess({
    status: 'ready',
    message: 'Scheduled cleanup endpoint is ready. POST to this endpoint to run cleanup.',
    defaultHoursOld: 24
  });
});