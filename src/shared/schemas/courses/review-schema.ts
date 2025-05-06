import { z } from 'zod';

/**
 * reviewSchema - Validation schema for review
 */
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment cannot exceed 500 characters'),
  courseId: z.string().min(1, 'Course ID is required'),
});

export type CreateReviewInput = z.infer<typeof reviewSchema>;
