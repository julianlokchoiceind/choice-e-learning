import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
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
  // Check if user with email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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