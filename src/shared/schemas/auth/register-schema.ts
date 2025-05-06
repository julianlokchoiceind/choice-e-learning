import { z } from 'zod';
import { emailSchema } from '../auth/email-schema';
import { passwordSchema } from '../auth/password-schema';

/**
 * registerUserSchema - Validation schema for registerUser
 */
export const registerUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['student', 'admin']).default('student'),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
