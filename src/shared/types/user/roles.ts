// src/shared/types/user/roles.ts

export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  USER = 'USER',
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['manage_all', 'view_all', 'edit_all'],
  [UserRole.INSTRUCTOR]: ['manage_courses', 'view_students', 'edit_content'],
  [UserRole.STUDENT]: ['view_courses', 'view_content', 'submit_assignments'],
  [UserRole.USER]: ['view_public'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}