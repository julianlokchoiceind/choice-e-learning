/**
 * @file User preferences type definitions
 * @description Type definitions for user preferences and settings
 */

import { z } from 'zod';

/**
 * User preferences interface
 */
export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  timezone: string;
  autoPlayVideos: boolean;
  showCompletedCourses: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema for creating user preferences
 */
export const createPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  autoPlayVideos: z.boolean().default(true),
  showCompletedCourses: z.boolean().default(true),
});

/**
 * Type for creating user preferences
 */
export type CreatePreferencesInput = z.infer<typeof createPreferencesSchema>;

/**
 * Schema for updating user preferences
 */
export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  autoPlayVideos: z.boolean().optional(),
  showCompletedCourses: z.boolean().optional(),
});

/**
 * Type for updating user preferences
 */
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>; 