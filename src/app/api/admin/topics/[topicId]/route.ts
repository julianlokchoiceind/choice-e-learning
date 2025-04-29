/**
 * Admin Topic Detail API endpoint
 * Handles operations on individual topics
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { topicService } from '@/lib/services/topics/topic-service';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/lib/api/api-response';
import { ApiErrorCode } from '@/lib/api/api-error-codes';
import { withAdmin } from '@/lib/api/route-handlers';

// Define the schema for topic update
const updateTopicSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

// GET handler to fetch a single topic
export const GET = withAdmin(async (_req, context) => {
  try {
    console.log(`[API] GET topic by ID: ${context.params.topicId}`);
    const topicId = context.params.topicId;
    
    if (!topicId) {
      console.warn('[API] Missing topic ID in request');
      // Trả về dữ liệu rỗng thay vì lỗi validation
      return apiSuccess(null, 'Topic ID is required');
    }
    
    try {
      const topic = await topicService.getTopicById(topicId);
      
      if (!topic) {
        console.log(`[API] Topic not found: ${topicId}`);
        // Trả về dữ liệu rỗng thay vì lỗi 404
        return apiSuccess(null, 'Topic not found');
      }
      
      console.log(`[API] Successfully retrieved topic: ${topic.name}`);
      return apiSuccess(topic, 'Topic retrieved successfully');
    } catch (serviceError) {
      console.error(`[API] Service error fetching topic ${topicId}:`, serviceError);
      // Trả về dữ liệu rỗng thay vì lỗi server
      return apiSuccess(null, 'Topic could not be retrieved');
    }
  } catch (error) {
    console.error('[API] Error in GET topic handler:', error);
    // Trả về dữ liệu rỗng thay vì lỗi server
    return apiSuccess(null, 'Failed to fetch topic');
  }
});

// PATCH handler to update a topic
export const PATCH = withAdmin(async (req, context) => {
  try {
    const topicId = context.params.topicId;
    
    if (!topicId) {
      return apiError('Topic ID is required', undefined, ApiErrorCode.VALIDATION_ERROR);
    }
    
    // Check if the topic exists
    const existingTopic = await topicService.getTopicById(topicId);
    
    if (!existingTopic) {
      return apiNotFound('Topic not found');
    }
    
    const body = await req.json();
    
    // Validate update data
    const validation = updateTopicSchema.safeParse(body);
    
    if (!validation.success) {
      return apiError(
        'Invalid topic data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Update the topic
    const updatedTopic = await topicService.updateTopic(topicId, validation.data);
    
    return apiSuccess(updatedTopic, 'Topic updated successfully');
  } catch (error: any) {
    console.error('Error updating topic:', error);
    
    // Check for duplicate name error
    if (error.message && error.message.includes('already exists')) {
      return apiError(
        error.message,
        undefined,
        ApiErrorCode.DUPLICATE_ENTRY
      );
    }
    
    return apiServerError('Failed to update topic');
  }
});

// DELETE handler to delete a topic
export const DELETE = withAdmin(async (_req, context) => {
  try {
    const topicId = context.params.topicId;
    
    if (!topicId) {
      return apiError('Topic ID is required', undefined, ApiErrorCode.VALIDATION_ERROR);
    }
    
    // Check if the topic exists
    const existingTopic = await topicService.getTopicById(topicId);
    
    if (!existingTopic) {
      return apiNotFound('Topic not found');
    }
    
    // Delete the topic
    await topicService.deleteTopic(topicId);
    
    return apiSuccess({ success: true }, 'Topic deleted successfully');
  } catch (error: any) {
    console.error('Error deleting topic:', error);
    
    // Check if the topic is associated with courses
    if (error.message && error.message.includes('associated with')) {
      return apiError(
        error.message,
        undefined,
        ApiErrorCode.FOREIGN_KEY_VIOLATION
      );
    }
    
    return apiServerError('Failed to delete topic');
  }
});
