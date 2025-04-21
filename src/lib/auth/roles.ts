import { Role } from '@/types/auth/roles';
import { User } from 'next-auth';

/**
 * Role management utilities
 * Centralized utilities for role-based access control
 */

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
 * Check if a user has the required role
 * @param user The user object
 * @param requiredRole The required role
 * @returns True if the user has the required role, false otherwise
 */
export function hasRole(user: User | null | undefined, requiredRole: Role): boolean {
  if (!user) return false;
  
  // Admin role has access to everything
  if (user.role === Role.admin) return true;
  
  // Check if user has the specific required role
  return user.role === requiredRole;
}

/**
 * Check if a user is authenticated
 * @param user The user object
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(user: User | null | undefined): boolean {
  return !!user;
}

/**
 * Check if a user has permission to perform an action on a resource
 * @param user The user object
 * @param resourceOwnerId The ID of the resource owner
 * @returns True if the user has permission, false otherwise
 */
export function hasPermission(user: User | null | undefined, resourceOwnerId: string | null): boolean {
  if (!user) return false;
  
  // Admins have permission to do anything
  if (user.role === Role.admin) return true;
  
  // If no resource owner, only admins have permission
  if (!resourceOwnerId) return false;
  
  // Users can only modify their own resources
  return user.id === resourceOwnerId;
}
