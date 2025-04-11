import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-options';
import { Role } from './auth-options';

/**
 * Get the current user's session on the server side
 * @returns The user's session or null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get the current authenticated user from the session
 * @returns The user object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if the current user has the required role
 * @param requiredRole The role required to access a resource
 * @returns True if the user has the required role, false otherwise
 */
export async function checkUserRole(requiredRole: Role) {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  // If admin role is required, only admin can access
  if (requiredRole === Role.admin) {
    return user.role === Role.admin;
  }
  
  // If instructor role is required, both admin and instructor can access
  if (requiredRole === Role.instructor) {
    return user.role === Role.admin || user.role === Role.instructor;
  }
  
  // If student role is required, anyone authenticated can access
  return true;
}

/**
 * Check if the current user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

/**
 * Check if the current user is an admin
 * @returns True if admin, false otherwise
 */
export async function isAdmin() {
  return await checkUserRole(Role.admin);
}

/**
 * Check if the current user is an instructor
 * @returns True if instructor or admin, false otherwise
 */
export async function isInstructor() {
  return await checkUserRole(Role.instructor);
}

/**
 * Check if the current user is a student
 * @returns True if authenticated, false otherwise
 */
export async function isStudent() {
  return await isAuthenticated();
} 