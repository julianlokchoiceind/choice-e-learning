/**
 * @file User type definitions
 * @description Type definitions for users, accounts, and profiles
 */

import { Role } from './auth/roles';

/**
 * User interface
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User with password interface - for internal use only
 */
export interface UserWithPassword extends User {
  password: string;
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
export interface UserProfile extends User {
  image?: string | null;
  coursesEnrolled?: number;
  challengesCompleted?: number;
}
