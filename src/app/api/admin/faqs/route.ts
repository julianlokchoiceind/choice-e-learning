import { NextRequest } from 'next/server';
import { apiSuccess, apiError, apiValidationError } from '@/server/api/api-response';
import { withAdmin } from '@/server/api/route-handlers';
import { z } from 'zod';
import { parseRequest } from '@/server/api/request-parser';
import { faqService } from '@/server/services/faq/faq-service';
import { ApiErrorCode } from '@/server/api/api-errors';

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
  } catch (error: unknown) {
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
    // Parse body first to get raw data
    const rawBody = await req.json();
    
    // Generate auto title if not provided
    if (!rawBody.question || rawBody.question.trim() === '') {
      // Format ngày hiện tại
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}${
        (today.getMonth() + 1).toString().padStart(2, '0')}${
        today.getFullYear()}`;
      
      try {
        // Tìm FAQs trong ngày
        const todayFAQs = await faqService.getAllFAQs({
          search: `-${dateStr}`,
          limit: 100
        });
        
        // Filter format chuẩn và tìm số lớn nhất
        const untitledPattern = new RegExp(`^Untitled-FAQ-(\\d+)-${dateStr}$`);
        let maxSequence = 0;
        
        if (todayFAQs.data && Array.isArray(todayFAQs.data)) {
          todayFAQs.data.forEach((faq: any) => {
            const match = faq.question.match(untitledPattern);
            if (match && match[1]) {
              const sequence = parseInt(match[1]);
              if (sequence > maxSequence) {
                maxSequence = sequence;
              }
            }
          });
        }
        
        // Tạo tiêu đề mới với format Untitled-FAQ-{number}-{date}
        rawBody.question = `Untitled-FAQ-${maxSequence + 1}-${dateStr}`;
        
        console.log(`Created new FAQ with question: ${rawBody.question}`);
        
      } catch (error) {
        console.error('Error finding FAQs:', error);
        // Fallback với timestamp
        const timestamp = Date.now();
        rawBody.question = `Untitled-FAQ-1-${dateStr}-${timestamp}`;
      }
    }
    
    // Set default values if not provided
    if (!rawBody.answer || rawBody.answer.trim() === '') {
      rawBody.answer = 'Answer pending...';
    }
    if (!rawBody.category || rawBody.category.trim() === '') {
      rawBody.category = 'General';
    }
    
    // Now validate with Zod
    const validatedData = createFAQSchema.parse(rawBody);
    
    const faq = await faqService.createFAQ(validatedData);
    
    return apiSuccess(faq, 'FAQ created successfully', undefined, 201);
  } catch (error: unknown) {
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
