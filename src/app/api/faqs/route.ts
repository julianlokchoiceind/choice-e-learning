import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { faqService } from '@/server/services/faq/faq-service';

// GET - Get all public FAQs with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Get public FAQ data
    const result = await faqService.getAllFAQs({
      search,
      category,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    
    return apiSuccess(result);
  } catch (error: unknown) {
    console.error('Error fetching public FAQs:', error);
    return apiError(
      'Failed to fetch FAQs',
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
}
