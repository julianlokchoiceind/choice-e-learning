import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { withAdmin } from '@/server/api/route-handlers';
import { faqService } from '@/server/services/faq/faq-service';
import { ApiErrorCode } from '@/server/api/api-errors';

// GET - Get all distinct FAQ categories
export const GET = withAdmin(async (_req: any) => {
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
});
