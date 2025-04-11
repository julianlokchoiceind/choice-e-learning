import { Role } from '@/lib/auth/auth-options';

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
 * User with password interface
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
 * User login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * User login response interface
 */
export interface LoginResponse {
  user: User;
  token: string;
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
 * User profile interface
 */
export interface UserProfile extends User {
  coursesEnrolled?: number;
  challengesCompleted?: number;
  instructorCourses?: number;
}

/**
 * User stats interface
 */
export interface UserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalChallenges: number;
  completedChallenges: number;
  averageRating?: number;
} 