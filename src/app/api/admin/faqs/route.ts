import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiValidationError } from '@/server/api/api-response';
import { withAdmin } from '@/server/api/route-handlers';
import { z } from 'zod';
import { parseRequest } from '@/server/api/request-parser';
import { faqService } from '@/server/services/faq/faq-service';
import { ApiErrorCode } from '@/server/api/api-error-codes';

// Schema for creating a FAQ
const createFAQSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required'),
});

// GET - Retrieve all FAQs with filtering, pagination
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    const result = await faqService.getAllFAQs({
      search,
      category,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    
    return apiSuccess(result);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return apiError(
      'Failed to fetch FAQs',
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
});

// POST - Create a new FAQ
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await parseRequest(req, createFAQSchema);
    
    const faq = await faqService.createFAQ(body);
    
    return apiSuccess(faq, 'FAQ created successfully', undefined, 201);
  } catch (error) {
    console.error('Error creating FAQ:', error);
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }
    
    return apiError(
      'Failed to create FAQ',
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
});
