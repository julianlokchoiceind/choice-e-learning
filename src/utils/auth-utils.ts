import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getCollection } from '@/lib/db/mongodb';
import { Role } from '@/lib/auth/auth-options';

/**
 * Hash a password with bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    console.log('Starting password hashing...');
    if (!password) {
      throw new Error('Password is required');
    }
    
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated successfully');
    
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');
    
    return hash;
  } catch (error) {
    console.error('Error in hashPassword function:', error);
    throw new Error(`Failed to hash password: ${(error as Error).message}`);
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param hashedPassword The hashed password
 * @returns True if the passwords match, false otherwise
 */
export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * Create a new user in the database
 * @param name The user's name
 * @param email The user's email
 * @param password The user's plain text password
 * @param role The user's role
 * @returns The created user object without the password
 */
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role = Role.student
) {
  try {
    const usersCollection = await getCollection('users');
    
    // Check if user with email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const now = new Date();
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: now,
      updatedAt: now,
    });
    
    if (!result.acknowledged) {
      throw new Error('Failed to create user');
    }

    // Return user without password
    return {
      id: result.insertedId.toString(),
      name,
      email,
      role,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Failed to create user: ${(error as Error).message}`);
  }
}

/**
 * Check if a user has permission to perform an action
 * @param userId The ID of the user performing the action
 * @param resourceOwnerId The ID of the resource owner
 * @param userRole The role of the user performing the action
 * @returns True if the user has permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  resourceOwnerId: string | null,
  userRole: Role
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

// If we need to use Prisma, we should wrap it in a function that checks if Prisma is available
export async function findUserWithPrisma(email: string) {
  // If Prisma is not available, fall back to MongoDB
  if (!prisma) {
    const usersCollection = await getCollection('users');
    return usersCollection.findOne({ email });
  }
  
  // Use Prisma if available
  return prisma.user.findUnique({
    where: { email }
  });
} 