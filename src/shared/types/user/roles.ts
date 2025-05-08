// src/shared/types/user/roles.ts

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  GUEST = 'guest'
}

export const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]: ['manage_all', 'view_all', 'edit_all'],
  [UserRole.STUDENT]: ['view_courses', 'view_content', 'submit_assignments'],
  [UserRole.GUEST]: ['view_public'],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}