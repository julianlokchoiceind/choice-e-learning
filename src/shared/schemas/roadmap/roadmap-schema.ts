import { z } from 'zod';
import { roadmapStepSchema } from './roadmap-step-schema';

/**
 * roadmapSchema - Validation schema for roadmap
 */
export const roadmapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  steps: z.array(roadmapStepSchema).min(1, 'At least one step is required'),
});

export type CreateRoadmapInput = z.infer<typeof roadmapSchema>;
