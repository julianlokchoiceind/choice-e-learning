/**
 * Marketing FAQ Categories API endpoint
 * Provides access to FAQ category data for marketing pages
 */

import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { faqService } from '@/server/services/faq/faq-service';

// GET - Get all FAQ categories
export async function GET(req: NextRequest) {
  try {
    const categories = await faqService.getAllCategories();
    return apiSuccess(categories);
  } catch (error: unknown) {
    console.error('Error fetching FAQ categories:', error);
    return apiError(
      'Failed to fetch FAQ categories',
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
} 