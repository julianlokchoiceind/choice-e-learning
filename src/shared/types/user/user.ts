/**
 * @file User type definitions
 * @description Type definitions for users, accounts, and profiles
 */

import { UserRole } from '@/shared/types/auth/roles';
import { Course } from '@/shared/types/courses/course';

/**
 * Extended User interface from Prisma schema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string | null;  // Not exposed to client, can be null for OAuth users
  createdAt: Date;
  updatedAt: Date;
  // Login tracking
  lastLoginAt?: Date | null;
  loginStreak?: number;
  // Relationships
  enrolledIn?: Course[];
  enrolledIds?: string[];
  achievements?: any[];
  reviews?: any[];
  progress?: any[];
  // Optional fields
  image?: string | null;
  bio?: string | null;
}

/**
 * User with password interface - for internal use only
 */
export interface UserWithPassword extends User {
  password: string | null;
}

/**
 * Create user request interface
 */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User update request interface
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

/**
 * User profile interface - expanded user info for profile pages
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  grade?: string;
  imageUrl?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Safe user type without sensitive information
 */
export type SafeUser = Omit<User, 'password'>;
