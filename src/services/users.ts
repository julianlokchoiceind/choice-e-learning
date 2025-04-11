"use server";

import { getCollection } from '@/lib/db';
import { createUserDirectly } from '@/lib/db';
import { hashPassword, comparePasswords } from '@/utils/auth-utils';
import { ObjectId } from 'mongodb';

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(email: string) {
  try {
    const usersCollection = await getCollection('users');
    return usersCollection.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
}

/**
 * Get a user by ID
 */
export async function getUserById(id: string) {
  try {
    const usersCollection = await getCollection('users');
    return usersCollection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(data: UserCreateInput): Promise<UserResponse> {
  const { name, email, password, role = 'student' } = data;
  
  try {
    console.log('Attempting to create user with email:', email);
    
    // Check if user already exists
    console.log('Checking if user already exists...');
    const existingUser = await getUserByEmail(email.toLowerCase());
    if (existingUser) {
      console.log('User with email already exists');
      throw new Error('User with this email already exists');
    }
    console.log('Email is available');
    
    // Hash the password
    console.log('Hashing password...');
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log('Password hashed successfully');
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      throw new Error('Failed to process password');
    }
    
    // Create user directly
    console.log('Creating user directly...');
    const result = await createUserDirectly({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });
    
    if (!result.success) {
      console.error('Failed to create user:', result.error);
      throw new Error(result.error || 'Failed to create user directly');
    }
    
    console.log('User created successfully with ID:', result.id);
    
    return {
      id: result.id || '',
      name: result.name || '',
      email: result.email || '',
      role: result.role || 'student',
      createdAt: new Date()
    };
    
  } catch (error) {
    console.error('Error in createUser function:', error);
    
    // Handle MongoDB connection error
    if ((error as Error).message.includes('connect ECONNREFUSED') || 
        (error as Error).message.includes('connection error')) {
      console.error('MongoDB connection error');
      throw new Error('Failed to connect to database. Please ensure MongoDB is running.');
    }
    
    // Handle duplicate key error
    if ((error as Error).message.includes('duplicate key') || 
        (error as Error).message.includes('already exists')) {
      console.error('Duplicate email error');
      throw new Error('User with this email already exists');
    }
    
    // Rethrow the original error
    throw error;
  }
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(email: string, password: string) {
  try {
    // Find the user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    // Verify the password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      id: user._id.toString()
    };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    throw error;
  }
}

/**
 * Check if the user has admin role
 */
export async function isAdmin(userId: string) {
  try {
    const user = await getUserById(userId);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error in isAdmin check:', error);
    return false;
  }
}

/**
 * Check if the user has instructor role
 */
export async function isInstructor(userId: string) {
  try {
    const user = await getUserById(userId);
    return user?.role === 'instructor' || user?.role === 'admin';
  } catch (error) {
    console.error('Error in isInstructor check:', error);
    return false;
  }
} 