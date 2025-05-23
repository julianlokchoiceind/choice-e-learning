'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useToast } from '@/client/hooks/common/useToast';
import { useRouter } from 'next/navigation';

/**
 * Hook for authentication operations using NextAuth
 * 
 * Provides functions for user authentication including login, logout,
 * and session management with proper error handling using NextAuth.
 * 
 * @returns Object containing NextAuth hooks for authentication operations
 * 
 * @example
 * // Login user
 * const { login, isLoading } = useAuth();
 * await login({ email: 'user@example.com', password: 'password' });
 * 
 * @example
 * // Get current user
 * const { user, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const { data: session, status } = useSession();
  const { success, error } = useToast();
  const router = useRouter();

  /**
   * Login user with credentials using NextAuth
   * 
   * @param credentials - User email and password
   * @returns Promise with success status and error if any
   */
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        error(result.error);
        return { success: false, error: result.error };
      }

      success('Đăng nhập thành công');
      router.push('/dashboard');
      return { success: true };
    } catch (err) {
      const message = 'Đăng nhập thất bại';
      error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Register a new user
   * 
   * @param credentials - User registration data (name, email, password)
   * @returns Promise with success status and error if any
   */
  const register = async (credentials: { name: string; email: string; password: string }) => {
    try {
      // Call API to register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        error(data.message || 'Đăng ký thất bại');
        return { success: false, error: data.message || 'Đăng ký thất bại' };
      }

      success('Đăng ký thành công');
      
      // Auto login after successful registration
      const loginResult = await login({
        email: credentials.email,
        password: credentials.password,
      });
      
      return loginResult;
    } catch (err) {
      const message = 'Đăng ký thất bại';
      error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Logout the current user using NextAuth
   */
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      success('Đăng xuất thành công');
      router.push('/');
    } catch (err) {
      error('Đăng xuất thất bại');
    }
  };

  return {
    // User data from NextAuth session
    user: session?.user,
    
    // Loading and authentication states
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    status,
    
    // Authentication actions
    login,
    register,
    logout,
  };
};

export default useAuth; 