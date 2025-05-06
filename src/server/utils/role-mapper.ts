/**
 * Role mapper utility
 * Maps between Prisma Role enum and application Role enum
 */

import { Role as AppRole } from '@/shared/types/auth/roles';
import { Role as PrismaRole } from '@prisma/client';

/**
 * Map Prisma Role to App Role
 * @param prismaRole Role from Prisma
 * @returns Equivalent role from App Role enum
 */
export function mapPrismaRoleToAppRole(prismaRole: PrismaRole): AppRole {
  switch (prismaRole) {
    case PrismaRole.admin:
      return AppRole.admin;
    case PrismaRole.student:
      return AppRole.student;
    case PrismaRole.deleted_user:
      return AppRole.deleted_user;
    default:
      return AppRole.student; // Default to student if unknown
  }
}

/**
 * Map App Role to Prisma Role
 * @param appRole Role from App Role enum
 * @returns Equivalent role from Prisma Role enum
 */
export function mapAppRoleToPrismaRole(appRole: AppRole): PrismaRole {
  switch (appRole) {
    case AppRole.admin:
      return PrismaRole.admin;
    case AppRole.student:
      return PrismaRole.student;
    case AppRole.deleted_user:
      return PrismaRole.deleted_user;
    default:
      return PrismaRole.student; // Default to student if unknown
  }
}
