import { z } from 'zod';
import { emailSchema } from '../auth/email-schema';

/**
 * loginUserSchema - Validation schema for loginUser
 */
export const loginUserSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
