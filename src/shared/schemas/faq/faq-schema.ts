import { z } from 'zod';

/**
 * faqSchema - Validation schema for faq
 */
export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question cannot exceed 200 characters'),
  answer: z.string().min(5, 'Answer must be at least 5 characters').max(1000, 'Answer cannot exceed 1000 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category cannot exceed 50 characters'),
});

export type CreateFAQInput = z.infer<typeof faqSchema>;
