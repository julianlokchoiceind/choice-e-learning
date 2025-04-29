import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { findUserById } from '@/lib/db/services/user-service';
import { 
  apiSuccess, 
  apiUnauthorized, 
  apiNotFound, 
  apiServerError 
} from '@/lib/api/api-response';

/**
 * GET handler to fetch current user data
 */
export async function GET(req: NextRequest) {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiUnauthorized('You must be logged in to access this resource');
    }
    
    // Get user from database
    const user = await findUserById(session.user.id);
    
    if (!user) {
      return apiNotFound('User');
    }
    
    // Return user data without password
    const { password, ...userData } = user;
    
    // Include login streak info
    return apiSuccess({
      ...userData,
      loginStreak: userData.loginStreak || 0,
      lastLoginAt: userData.lastLoginAt || null
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return apiServerError('Failed to fetch user data');
  }
} 