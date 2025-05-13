import { z } from 'zod';

/**
 * courseSchema - Validation schema for course
 */
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  topics: z.array(z.string()).min(1, 'At least one topic is required'),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export type CreateCourseInput = z.infer<typeof courseSchema>;
