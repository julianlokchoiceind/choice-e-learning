/**
 * Password utilities for authentication
 */
import bcrypt from 'bcryptjs';

/**
 * Hash a password with bcrypt
 * @param password The plain text password to hash
 * @returns The hashed password
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    if (!password) {
      throw new Error('Password is required');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
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
