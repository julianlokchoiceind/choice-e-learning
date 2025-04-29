import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { topicService } from '@/lib/services/topics/topic-service';

/**
 * GET handler for course topics
 * Returns all active topics for course selection
 */
export async function GET(_req: NextRequest) {
  try {
    const topics = await topicService.getAllActiveTopics();
    return apiSuccess(topics);
  } catch (error) {
    console.error('Error fetching course topics:', error);
    return apiError(
      "Failed to fetch topics",
      error instanceof Error ? error.message : String(error)
    );
  }
}
