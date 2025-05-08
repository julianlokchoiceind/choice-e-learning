/**
 * Role mapper utility
 * Maps between Prisma Role enum and application Role enum
 */

import { UserRole } from '@/shared/types/auth/roles';
import { Role as PrismaRole } from '@prisma/client';

/**
 * Map Prisma Role to App Role
 * @param prismaRole Role from Prisma
 * @returns Equivalent role from App Role enum
 */
export function mapPrismaRoleToAppRole(prismaRole: PrismaRole): UserRole {
  switch (prismaRole) {
    case PrismaRole.admin:
      return UserRole.ADMIN;
    case PrismaRole.student:
      return UserRole.STUDENT;
    case PrismaRole.deleted_user:
      return UserRole.GUEST; // Map deleted_user to GUEST
    default:
      return UserRole.STUDENT; // Default to student if unknown
  }
}

/**
 * Map App Role to Prisma Role
 * @param appRole Role from App Role enum
 * @returns Equivalent role from Prisma Role enum
 */
export function mapAppRoleToPrismaRole(appRole: UserRole): PrismaRole {
  switch (appRole) {
    case UserRole.ADMIN:
      return PrismaRole.admin;
    case UserRole.STUDENT:
      return PrismaRole.student;
    case UserRole.GUEST:
      return PrismaRole.deleted_user;
    default:
      return PrismaRole.student; // Default to student if unknown
  }
}
