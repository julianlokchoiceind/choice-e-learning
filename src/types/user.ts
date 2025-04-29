/**
 * @file User type definitions
 * @description Type definitions for users, accounts, and profiles
 */

import { Role } from './auth/roles';
import { Course } from './course';

/**
 * Extended User interface from Prisma schema
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
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
  role?: Role;
}

/**
 * User update request interface
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

/**
 * User profile interface - expanded user info for profile pages
 */
export interface UserProfile extends Omit<User, 'password'> {
  image?: string | null;
  coursesEnrolled?: number;
  challengesCompleted?: number;
}

/**
 * Safe user type without sensitive information
 */
export type SafeUser = Omit<User, 'password'>;
