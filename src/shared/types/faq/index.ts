import { z } from 'zod';
import { FAQ } from '@prisma/client';

// FAQ types
export type FAQItem = FAQ;

// Schema for creating a FAQ
export const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().min(1, "Category is required"),
});

// Type for creating a FAQ
export type CreateFAQInput = z.infer<typeof createFAQSchema>;

// Schema for updating a FAQ
export const updateFAQSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});

// Type for updating a FAQ
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;

// FAQ filtering and pagination
export interface FAQFilter {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// FAQ API response with pagination
export interface FAQPaginatedResult {
  data: FAQItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
