import { z } from 'zod';

/**
 * roadmapStepSchema - Validation schema for roadmapStep
 */
export const roadmapStepSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  order: z.number().int().min(1, 'Order must be at least 1'),
  resources: z.array(z.string()).optional(),
});

export type RoadmapStepInput = z.infer<typeof roadmapStepSchema>;
