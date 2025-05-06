import { z } from 'zod';

/**
 * challengeSchema - Validation schema for challenge
 */
export const challengeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
});

export type CreateChallengeInput = z.infer<typeof challengeSchema>;
