"use server";

import prisma from '@/lib/db';
import { User, Prisma } from '@prisma/client';
import { hashPassword, comparePasswords } from '@/lib/auth/utils/password-utils';
import { CreateUserRequest } from '@/types/user';

/**
 * Find a user by ID
 * @param id User ID
 * @returns User object or null if not found
 */
export async function findUserById(id: string): Promise<User | null> {
  try {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return null;
    }
    
    return await prisma.user.findUnique({
      where: { id }
    });
  } catch (error) {
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
    
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
  } catch (error) {
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
        role: userData.role || 'student',
      }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
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
    
    const user = await prisma.user.update({
      where: { id },
      data
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
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
  role: 'student' | 'admin'
): Promise<Omit<User, 'password'> | null> {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
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
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) return null;
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
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
  page: number = 1, 
  pageSize: number = 10,
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
    
    // Remove passwords
    const usersWithoutPasswords = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    
    return {
      users: usersWithoutPasswords,
      total,
      pages
    };
  } catch (error) {
    console.error('Error getting users:', error);
    return {
      users: [],
      total: 0,
      pages: 0
    };
  }
}

/**
 * Update user's last login and login history
 * @param id User ID
 * @returns Success flag
 */
export async function updateUserLoginInfo(id: string): Promise<boolean> {
  try {
    const now = new Date();
    
    await prisma.user.update({
      where: { id },
      data: {
        updatedAt: now
        // Note: The loginHistory field is not part of the Prisma schema
        // We would need to add it to the schema if needed
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error updating login info:', error);
    return false;
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
    return userWithoutPassword;
  } catch (error) {
    console.error('Error deleting user:', error);
    return null;
  }
}
