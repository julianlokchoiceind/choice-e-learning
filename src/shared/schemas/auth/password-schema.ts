import { z } from 'zod';

/**
 * passwordSchema - Validation schema for password
 */
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password cannot exceed 100 characters');

export type PasswordInput = z.infer<typeof passwordSchema>;
