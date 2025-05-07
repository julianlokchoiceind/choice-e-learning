'use server';

import { User } from '@/shared/types/user';
import { comparePasswords } from '../utils/password-utils';
import { findUserByEmail, findUserById, createUser as createUserRecord, updateUserRole as updateUserRoleDb, updateUserLoginInfo } from '@/server/db/services/user-service';
import { CreateUserRequest } from '@/shared/types/user';

import { Role } from '@/shared/types/auth/roles';

/**
 * Interface for login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Interface for registration credentials
 */
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface for authentication errors
 */
export interface AuthError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Interface for authentication response
 */
export interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

/**
 * Login a user with email and password
 * @param credentials Login credentials
 * @returns Authentication response with user data
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse<Omit<User, 'password'>>> {
  try {
    // Validate credentials
    if (!credentials.email || !credentials.password) {
      return {
        success: false,
        error: {
          message: 'Email and password are required',
          status: 400,
          code: 'MISSING_CREDENTIALS'
        }
      };
    }

    // Find user by email (case insensitive)
    const user = await findUserByEmail(credentials.email);
    
    // Check if user exists
    if (!user) {
      return {
        success: false,
        error: {
          message: 'Invalid email or password',
          status: 401,
          code: 'INVALID_CREDENTIALS'
        }
      };
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(credentials.password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: {
          message: 'Invalid email or password',
          status: 401,
          code: 'INVALID_CREDENTIALS'
        }
      };
    }
    
    // Update login history
    await updateUserLoginInfo(user.id);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      success: true,
      data: userWithoutPassword
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: {
        message: (error as Error).message || 'An error occurred during login',
        status: 500,
        code: 'SERVER_ERROR'
      }
    };
  }
}

/**
 * Register a new user
 * @param credentials Registration credentials
 * @returns Authentication response with user data
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse<Omit<User, 'password'>>> {
  try {
    // Validate credentials
    if (!credentials.name || !credentials.email || !credentials.password) {
      return {
        success: false,
        error: {
          message: 'Name, email, and password are required',
          status: 400,
          code: 'MISSING_CREDENTIALS'
        }
      };
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(credentials.email);
    
    if (existingUser) {
      return {
        success: false,
        error: {
          message: 'User with this email already exists',
          status: 409,
          code: 'USER_EXISTS'
        }
      };
    }
    
    // Create the user
    const newUserData: CreateUserRequest = {
      name: credentials.name,
      email: credentials.email.toLowerCase(),
      password: credentials.password,
      role: Role.student
    };
    
    const user = await createUserRecord(newUserData);
    
    if (!user) {
      return {
        success: false,
        error: {
          message: 'Failed to create user',
          status: 500,
          code: 'DATABASE_ERROR'
        }
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error('Register error:', error);
    return {
      success: false,
      error: {
        message: (error as Error).message || 'An error occurred during registration',
        status: 500,
        code: 'SERVER_ERROR'
      }
    };
  }
}

/**
 * Get user by ID
 * @param id User ID
 * @returns User object without password or null if user not found
 */
export async function getUserById(id: string): Promise<Omit<User, 'password'> | null> {
  try {
    if (!id) return null;
    
    const user = await findUserById(id);
    
    if (!user) return null;
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

/**
 * Get user by email
 * @param email User email
 * @returns User object without password or null if user not found
 */
export async function getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
  try {
    if (!email) return null;
    
    const user = await findUserByEmail(email);
    
    if (!user) return null;
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Get user by email error:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param userData User data
 * @returns Authentication response with user data
 */
export async function createUser(userData: CreateUserRequest): Promise<AuthResponse<Omit<User, 'password'>>> {
  try {
    // Validate user data
    if (!userData.name || !userData.email || !userData.password) {
      return {
        success: false,
        error: {
          message: 'Name, email, and password are required',
          status: 400,
          code: 'MISSING_DATA'
        }
      };
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(userData.email);
    
    if (existingUser) {
      return {
        success: false,
        error: {
          message: 'User with this email already exists',
          status: 409,
          code: 'USER_EXISTS'
        }
      };
    }
    
    // Create the user
    const user = await createUserRecord(userData);
    
    if (!user) {
      return {
        success: false,
        error: {
          message: 'Failed to create user',
          status: 500,
          code: 'DATABASE_ERROR'
        }
      };
    }
    
    return {
      success: true,
      data: user
    };
  } catch (error) {
    console.error('Create user error:', error);
    return {
      success: false,
      error: {
        message: (error as Error).message || 'An error occurred while creating user',
        status: 500,
        code: 'SERVER_ERROR'
      }
    };
  }
}

/**
 * Update user role
 * @param userId User ID
 * @param newRole New role
 * @returns Success status and updated user or error
 */
export async function updateUserRoleAuth(
  userId: string, 
  newRole: Role.student | Role.admin
): Promise<AuthResponse<Omit<User, 'password'>>> {
  try {
    if (!userId || !newRole) {
      return {
        success: false,
        error: {
          message: 'User ID and new role are required',
          status: 400,
          code: 'MISSING_DATA'
        }
      };
    }
    
    // Validate role value
    if (newRole !== Role.student && newRole !== Role.admin) {
      return {
        success: false,
        error: {
          message: 'Invalid role',
          status: 400,
          code: 'INVALID_ROLE'
        }
      };
    }
    
    // Update user role
    const updatedUser = await updateUserRoleDb(userId, newRole);
    
    if (!updatedUser) {
      return {
        success: false,
        error: {
          message: 'User not found',
          status: 404,
          code: 'USER_NOT_FOUND'
        }
      };
    }
    
    return {
      success: true,
      data: updatedUser
    };
  } catch (error) {
    console.error('Update user role error:', error);
    return {
      success: false,
      error: {
        message: (error as Error).message || 'An error occurred while updating user role',
        status: 500,
        code: 'SERVER_ERROR'
      }
    };
  }
}

/**
 * Check if user has permission to access a resource
 * @param userId User ID
 * @param resourceOwnerId Resource owner ID
 * @param userRole User role
 * @returns True if user has permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  resourceOwnerId: string | null,
  userRole: Role.student | Role.admin
): Promise<boolean> {
  // Admins have permission to do anything
  if (userRole === Role.admin) {
    return true;
  }

  // If no resource owner, only admins have permission
  if (!resourceOwnerId) {
    return false;
  }

  // Users can only modify their own resources
  return userId === resourceOwnerId;
}
