/**
 * @file User service
 * @description Provides functions for user management
 */
export const dynamic = 'force-dynamic';

import prisma from '@/server/db/prisma-client';
import { Prisma } from '@prisma/client';
import { User, SafeUser } from '@/shared/types/user';
import { hashPassword, comparePasswords } from '@/server/auth/utils/password-utils';
import { CreateUserRequest } from '@/shared/types/user';
import { Role as PrismaRole } from '@prisma/client';
import { UserRole } from '@/shared/types/auth/roles';
import { mapAppRoleToPrismaRole, mapPrismaRoleToAppRole } from '@/server/utils/role-mapper';

/**
 * Find a user by ID
 * @param id User ID
 * @returns User object or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    if (!id) {
      return null;
    }
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) return null;
    
    // Convert Prisma Role to App Role
    return {
      ...user,
      password: user.password || '',
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

/**
 * Find a user by email
 * @param email User email
 * @returns User object or null if not found
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    if (!email) return null;
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) return null;
    
    // Convert Prisma Role to App Role
    return {
      ...user,
      password: user.password || '',
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param userData User data with plaintext password
 * @returns Created user without password or null if creation failed
 */
export async function createUser(userData: CreateUserRequest): Promise<Omit<User, 'password'> | null> {
  try {
    // Hash the password
    const hashedPassword = await hashPassword(userData.password);
    
    // Create the user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        role: mapAppRoleToPrismaRole(userData.role || UserRole.STUDENT),
      }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    // Convert Prisma Role to App Role
    return {
      ...userWithoutPassword,
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user data
 * @param id User ID
 * @param data User data to update
 * @returns Updated user without password or null if update failed
 */
export async function updateUser(
  id: string, 
  data: Prisma.UserUpdateInput
): Promise<Omit<User, 'password'> | null> {
  try {
    // If password is being updated, hash it first
    if (typeof data.password === 'string') {
      data.password = await hashPassword(data.password);
    }
    
    // Map role if provided
    if (data.role) {
      data.role = mapAppRoleToPrismaRole(data.role as unknown as UserRole);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    // Convert Prisma Role to App Role
    return {
      ...userWithoutPassword,
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Update user role
 * @param id User ID
 * @param role New role
 * @returns Updated user without password or null if update failed
 */
export async function updateUserRole(
  id: string, 
  role: UserRole
): Promise<Omit<User, 'password'> | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: mapAppRoleToPrismaRole(role) }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    // Convert Prisma Role to App Role
    return {
      ...userWithoutPassword,
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error updating user role:', error);
    return null;
  }
}

/**
 * Verify user credentials
 * @param email User email
 * @param password User plaintext password
 * @returns User without password if credentials valid, null otherwise
 */
export async function verifyUserCredentials(
  email: string, 
  password: string
): Promise<Omit<User, 'password'> | null> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (!user) return null;
    
    // Verify password
    // comparePasswords will handle null password internally
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) return null;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Convert Prisma Role to App Role
    return {
      ...userWithoutPassword,
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error verifying credentials:', error);
    return null;
  }
}

/**
 * Get users with pagination
 * @param page Page number (1-based)
 * @param pageSize Page size
 * @param whereClause Optional filter criteria
 * @returns Paginated users without passwords
 */
export async function getUsers(
  page = 1, 
  pageSize = 10,
  whereClause: Prisma.UserWhereInput = {}
): Promise<{
  users: Omit<User, 'password'>[];
  total: number;
  pages: number;
}> {
  try {
    // Ensure page and pageSize are valid
    page = Math.max(1, page);
    pageSize = Math.max(1, Math.min(100, pageSize));
    
    // Get total count
    const total = await prisma.user.count({
      where: whereClause
    });
    
    // Calculate total pages
    const pages = Math.ceil(total / pageSize);
    
    // Get users for the requested page
    const users = await prisma.user.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });
    
    // Remove passwords and map roles
    const usersWithoutPasswords = users.map(user => {
      const { password, ...rest } = user;
      return {
        ...rest,
        role: mapPrismaRoleToAppRole(user.role)
      };
    });
    
    return {
      users: usersWithoutPasswords,
      total,
      pages
    };
  } catch (error: unknown) {
    console.error('Error getting users:', error);
    return {
      users: [],
      total: 0,
      pages: 0
    };
  }
}

/**
 * Update user's login streak information
 * @param id User ID to update
 * @returns Success flag
 */
export async function updateLoginStreak(id: string): Promise<boolean> {
  try {
    const now = new Date();
    
    // Get user data from Prisma
    const userData = await prisma.user.findUnique({
      where: { id },
      select: {
        loginStreak: true,
        lastLoginAt: true
      }
    });
    
    if (!userData) {
      console.error('User not found when updating login streak');
      return false;
    }
    
    // Calculate if this is a streak continuation
    let newLoginStreak = userData.loginStreak || 0;
    
    if (userData.lastLoginAt) {
      // Get last login date (without time)
      const lastLoginDate = new Date(userData.lastLoginAt);
      lastLoginDate.setHours(0, 0, 0, 0);
      
      // Get current date (without time)
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date (without time)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if last login was yesterday (streak continues)
      if (lastLoginDate.getTime() === yesterday.getTime()) {
        newLoginStreak++;
      } 
      // If last login was today, maintain streak but don't increment
      else if (lastLoginDate.getTime() === today.getTime()) {
        // Do nothing, keep same streak
      } 
      // If last login was before yesterday, reset streak
      else {
        newLoginStreak = 1; // Reset streak but count today
      }
    } else {
      // First login ever
      newLoginStreak = 1;
    }
    
    // Update user using prisma
    await prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: now,
        loginStreak: newLoginStreak,
        updatedAt: now
      }
    });
    
    return true;
  } catch (error: unknown) {
    console.error('Error updating login streak:', error);
    return false;
  }
}

/**
 * Get user's current login streak
 * @param userId User ID
 * @returns Current login streak or 0 if not found
 */
export async function getUserLoginStreak(userId: string): Promise<number> {
  try {
    // Get user data from Prisma
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        loginStreak: true
      }
    });
    
    return userData?.loginStreak || 0;
  } catch (error: unknown) {
    console.error('Error getting user login streak:', error);
    return 0;
  }
}

/**
 * Delete a user
 * @param id User ID
 * @returns Deleted user without password or null if deletion failed
 */
export async function deleteUser(id: string): Promise<Omit<User, 'password'> | null> {
  try {
    const user = await prisma.user.delete({
      where: { id }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    
    // Convert Prisma Role to App Role
    return {
      ...userWithoutPassword,
      role: mapPrismaRoleToAppRole(user.role)
    };
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    return null;
  }
}

/**
 * Update user's login information
 * @param id User ID to update
 * @returns Success flag
 */
export async function updateUserLoginInfo(id: string): Promise<boolean> {
  try {
    if (!id) return false;
    return await updateLoginStreak(id);
  } catch (error: unknown) {
    console.error('Error updating user login info:', error);
    return false;
  }
}