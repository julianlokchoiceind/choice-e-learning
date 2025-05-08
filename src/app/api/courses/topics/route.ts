import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { topicService } from '@/server/services/topics/topic-service';

/**
 * GET handler for course topics
 * Returns all active topics for course selection
 */
export async function GET(_req: NextRequest) {
  try {
    const topics = await topicService.getAllActiveTopics();
    return apiSuccess(topics);
  } catch (error: unknown) {
    console.error('Error fetching course topics:', error);
    return apiError(
      'Failed to fetch topics',
      error instanceof Error ? error.message : String(error)
    );
  }
}
