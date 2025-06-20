import { z } from 'zod';

export const createCourseReferenceLinkSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters'),
  url: z.string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL'),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be positive')
    .optional()
});

export const updateCourseReferenceLinkSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  url: z.string()
    .min(1, 'URL is required')
    .url('Please enter a valid URL')
    .optional(),
  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  order: z.number()
    .int('Order must be an integer')
    .min(0, 'Order must be positive')
    .optional(),
  isActive: z.boolean().optional()
});

export const courseReferenceLinkFilterSchema = z.object({
  isActive: z.boolean().optional(),
  search: z.string().optional()
});

export type CreateCourseReferenceLinkData = z.infer<typeof createCourseReferenceLinkSchema>;
export type UpdateCourseReferenceLinkData = z.infer<typeof updateCourseReferenceLinkSchema>;
export type CourseReferenceLinkFilterData = z.infer<typeof courseReferenceLinkFilterSchema>;