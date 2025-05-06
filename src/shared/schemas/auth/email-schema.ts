import { z } from 'zod';

/**
 * emailSchema - Validation schema for email
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email cannot exceed 255 characters');

export type EmailInput = z.infer<typeof emailSchema>;
