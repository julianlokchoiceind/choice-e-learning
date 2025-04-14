// Export user types
export * from './user';

// Export course types
export * from './course';

// These modules will be created in future phases
// export * from './challenge';
// export * from './review';
// export * from './faq';
// export * from './roadmap';

// Shared types

/**
 * Common API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * Common pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Common pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Common paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// User-related types
import { Role } from '@/lib/auth/auth-options';

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User achievement interface
 */
export interface UserAchievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: AchievementType;
}

/**
 * Achievement types
 */
export enum AchievementType {
  FIRST_LOGIN = 'first_login',
  COURSE_STARTED = 'course_started',
  COURSE_COMPLETED = 'course_completed',
  LESSON_COMPLETED = 'lesson_completed',
  STREAK = 'streak',
  QUICK_LEARNER = 'quick_learner',
}

/**
 * User progress interface
 */
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  progress: number; // 0-100
  timeSpent: number; // in seconds
} 