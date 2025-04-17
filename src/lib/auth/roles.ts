import { Role } from './auth-options';
import { User } from 'next-auth';

/**
 * Check if a user has the admin role
 * @param user The user object
 * @returns True if the user is an admin, false otherwise
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === Role.admin;
}

/**
 * Check if a user has the student role
 * @param user The user object
 * @returns True if the user is a student, false otherwise
 */
export function isStudent(user: User | null | undefined): boolean {
  if (!user) return false;
  return user.role === Role.student;
}

/**
 * Check if a user is authenticated
 * @param user The user object
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  return !!user;
} 