"use server";

import { getCollection } from '@/lib/db';
import { createUserDirectly } from '@/lib/db';
import { hashPassword, comparePasswords } from '@/utils/auth-utils';
import { ObjectId } from 'mongodb';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

/**
 * Login a user with email and password
 */
export async function login(credentials: LoginCredentials) {
  try {
    // Validate credentials
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    // Get user collection
    const usersCollection = await getCollection('users');
    
    // Find user by email
    const user = await usersCollection.findOne({ email: credentials.email.toLowerCase() });
    
    // Check if user exists
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      id: user._id.toString(),
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(credentials: RegisterCredentials) {
  try {
    // Validate credentials
    if (!credentials.name || !credentials.email || !credentials.password) {
      throw new Error('Name, email, and password are required');
    }
    
    // Check if user already exists
    const usersCollection = await getCollection('users');
    const existingUser = await usersCollection.findOne({ email: credentials.email.toLowerCase() });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hashPassword(credentials.password);
    
    // Create user
    const result = await createUserDirectly({
      name: credentials.name,
      email: credentials.email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create user');
    }
    
    return {
      success: true,
      id: result.id,
      name: result.name,
      email: result.email,
    };
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  try {
    if (!id) return null;
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      id: user._id.toString(),
    };
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
} 