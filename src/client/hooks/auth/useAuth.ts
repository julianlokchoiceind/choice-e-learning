'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useToast } from '@/client/hooks/common/useToast';
import { useRouter } from 'next/navigation';
import { logSessionEvent, logSessionState, logLogout, logAuthError } from '@/client/utils/session';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';

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
  const router = useRouter();
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();
  // Remove the direct useToast import as we'll use QueryProvider for toasts

  /**
   * Login user with credentials using NextAuth
   * 
   * @param credentials - User email and password
   * @returns Promise with success status and error if any
   */
  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Log login attempt
      logSessionEvent('session_created', `Login attempt for ${credentials.email}`, 'info');
      
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        // Log login failure
        logAuthError(`Login failed for ${credentials.email}: ${result.error}`);
        // Use error toast from QueryProvider via meta
        return { success: false, error: result.error };
      }

      // After successful login, the session will be updated
      // We'll log the session state in the useEffect hook when session changes
      
      // Success toast will be handled by QueryProvider
      router.push('/dashboard');
      return { 
        success: true,
        meta: {
          successToast: 'Successfully signed in'
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      // Log login error
      logAuthError(`Login failed for ${credentials.email}`, error);
      const message = 'Sign in failed';
      // Let this error propagate to QueryProvider's error handler
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
      // Call API to register user using useApiRequest
      const response = await apiRequest.post('/api/auth/register', credentials);
      
      // Kiểm tra response null/undefined
      if (!response) {
        return { 
          success: false, 
          error: 'Registration failed: No response', 
          meta: {
            errorToast: 'Registration failed: No response'
          }
        };
      }
      
      // Kiểm tra response success
      if (!response.data || !response.data.success) {
        // Let error handling be consistent with QueryProvider
        return { 
          success: false, 
          error: response.data?.message || 'Registration failed', 
          meta: {
            errorToast: response.data?.message || 'Registration failed'
          }
        };
      }

      // Auto login after successful registration
      const loginResult = await login({
        email: credentials.email,
        password: credentials.password,
      });
      
      return {
        ...loginResult,
        meta: {
          successToast: 'Registration successful'
        }
      };
    } catch (err) {
      const message = 'Registration failed';
      // Let error propagate to QueryProvider
      return { 
        success: false, 
        error: message,
        meta: {
          errorToast: message
        }
      };
    }
  };

  /**
   * Logout the current user using NextAuth
   * @returns A promise with logout status
   */
  const logout = async () => {
    try {
      // Log logout initiation with current session data
      logLogout('initiated', session);
      
      // First, manually clear any NextAuth cookies to ensure complete session removal
      if (typeof window !== 'undefined') {
        // Get all cookies and clear any that are related to NextAuth
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name.includes('next-auth')) {
            // Set expiry to past date to remove the cookie
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            logSessionEvent('session_expired', `Cleared cookie: ${name}`, 'debug');
          }
        });
      }
      
      // Then call NextAuth signOut to properly invalidate the session on the server
      await signOut({ redirect: false });
      logSessionEvent('session_expired', 'Session invalidated on server', 'info');
      
      // Force a complete page reload to reset all React state and ensure clean session state
      if (typeof window !== 'undefined') {
        // Log before redirect
        logLogout('completed', null);
        // Use location.href with cache-busting parameter to prevent any caching
        window.location.href = `/?logout=${Date.now()}`;
      } else {
        // Fallback if running in a server context
        logLogout('completed', null);
        router.push('/');
        router.refresh();
      }
      
      // Return success - toast will be handled by QueryProvider
      return { 
        success: true,
        meta: {
          successToast: 'Successfully signed out'
        }
      };
    } catch (err) {
      // Log logout error
      const error = err instanceof Error ? err : new Error('Unknown logout error');
      logLogout('error', session, error);
      
      // Let error propagate to QueryProvider
      return { 
        success: false, 
        error: 'Sign out failed',
        meta: {
          errorToast: 'Sign out failed'
        }
      };
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