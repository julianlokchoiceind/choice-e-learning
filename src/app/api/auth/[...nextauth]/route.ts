import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Higher-order function for error handling
const withErrorHandling = (handler) => async (req, res) => {
  try {
    return await handler(req, res);
  } catch (error) {
    console.error('NextAuth error:', error);
    throw error;
  }
};

// Initialize NextAuth handler
const handler = NextAuth(authOptions);

// Export handlers with error handling
export const GET = withErrorHandling(handler);
export const POST = withErrorHandling(handler);