/**
 * @file Role definitions for user authentication and authorization
 * @description Centralized definition of roles used throughout the application
 */

/**
 * User roles in the system
 * @enum {string}
 */
export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  GUEST = 'guest'
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export const hasPermission = (
  userPermissions: Permission[], 
  requiredPermission: string
): boolean => {
  return userPermissions.some(p => p.name === requiredPermission);
};
