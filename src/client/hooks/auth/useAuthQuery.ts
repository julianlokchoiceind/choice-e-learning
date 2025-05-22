'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/client/utils/http/api-client';
import { useToast } from '@/client/hooks/common/useToast';
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';

// Định nghĩa các interfaces cần thiết
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordUpdateRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

interface UserUpdateRequest {
  name?: string;
  email?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * API endpoints for authentication operations
 */
const API = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
  RESET_PASSWORD: '/api/auth/reset-password',
  UPDATE_PASSWORD: '/api/auth/update-password',
  UPDATE_PROFILE: '/api/auth/profile',
};

// Helper functions for token management
const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

/**
 * Hook for authentication operations using React Query
 * 
 * Provides functions for user authentication including login, registration,
 * logout, and session management with proper error handling.
 * 
 * @returns Object containing React Query hooks for authentication operations
 * 
 * @example
 * // Login user
 * const { login, isLoggingIn } = useAuthQuery();
 * login.mutate({ email: 'user@example.com', password: 'password' });
 * 
 * @example
 * // Get current user
 * const { data: currentUser, isLoading } = useGetCurrentUser();
 */
export const useAuthQuery = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const { showErrorToast } = useQueryUtils();

  /**
   * Fetch the current authenticated user
   * 
   * @returns Query result with current user data, loading state, and error
   */
  const useGetCurrentUser = () => {
    return useQuery({
      queryKey: ['auth', 'currentUser'],
      queryFn: async (): Promise<User> => {
        try {
          const response = await apiClient.get(API.ME);
          return response.data;
        } catch (err) {
          // If 401 Unauthorized, clear token
          if (err instanceof Error && 'response' in err && 
              typeof err.response === 'object' && err.response && 
              'status' in err.response && err.response.status === 401) {
            removeToken();
          }
          throw err;
        }
      },
      enabled: !!getToken(), // Only run if token exists
      retry: false, // Don't retry on auth errors
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  /**
   * Login user with credentials
   * 
   * @returns Mutation function and state for user login
   */
  const useLogin = () => {
    return useMutation({
      mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post(API.LOGIN, credentials);
        return response.data;
      },
      onSuccess: (data) => {
        // Save authentication token
        saveToken(data.token);
        
        // Update auth headers for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update current user data
        queryClient.setQueryData(['auth', 'currentUser'], data.user);
        
        // Invalidate any queries that depend on authentication
        queryClient.invalidateQueries({ queryKey: ['auth'] });
        
        success('Đăng nhập thành công');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Đăng nhập thất bại');
        throw err;
      },
    });
  };

  /**
   * Register a new user
   * 
   * @returns Mutation function and state for user registration
   */
  const useRegister = () => {
    return useMutation({
      mutationFn: async (userData: RegisterCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post(API.REGISTER, userData);
        return response.data;
      },
      onSuccess: (data) => {
        // Save authentication token
        saveToken(data.token);
        
        // Update auth headers for subsequent requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        // Update current user data
        queryClient.setQueryData(['auth', 'currentUser'], data.user);
        
        success('Đăng ký tài khoản thành công');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Đăng ký tài khoản thất bại');
        throw err;
      },
    });
  };

  /**
   * Logout the current user
   * 
   * @returns Mutation function and state for user logout
   */
  const useLogout = () => {
    return useMutation({
      mutationFn: async (): Promise<void> => {
        // Only make the API call if we have a token
        if (getToken()) {
          await apiClient.post(API.LOGOUT);
        }
      },
      onSuccess: () => {
        // Remove auth token
        removeToken();
        
        // Remove auth header
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Clear user data from cache
        queryClient.removeQueries({ queryKey: ['auth', 'currentUser'] });
        
        // Reset any authenticated queries
        queryClient.invalidateQueries();
        
        success('Đăng xuất thành công');
      },
      onError: (err: AxiosError) => {
        // Even if the API call fails, we still want to clear local auth state
        removeToken();
        delete apiClient.defaults.headers.common['Authorization'];
        queryClient.removeQueries({ queryKey: ['auth', 'currentUser'] });
        
        showErrorToast(err, 'Đăng xuất thất bại');
      },
    });
  };

  /**
   * Request password reset for a user
   * 
   * @returns Mutation function and state for password reset request
   */
  const useRequestPasswordReset = () => {
    return useMutation({
      mutationFn: async (data: PasswordResetRequest): Promise<void> => {
        await apiClient.post(API.RESET_PASSWORD, data);
      },
      onSuccess: () => {
        success('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn');
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể gửi yêu cầu đặt lại mật khẩu');
        throw err;
      },
    });
  };

  /**
   * Update user password with reset token
   * 
   * @returns Mutation function and state for password update
   */
  const useUpdatePassword = () => {
    return useMutation({
      mutationFn: async (data: PasswordUpdateRequest): Promise<void> => {
        await apiClient.post(API.UPDATE_PASSWORD, data);
      },
      onSuccess: () => {
        success('Mật khẩu đã được cập nhật thành công');
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể cập nhật mật khẩu');
        throw err;
      },
    });
  };

  /**
   * Update user profile information
   * 
   * @returns Mutation function and state for profile update
   */
  const useUpdateProfile = () => {
    return useMutation({
      mutationFn: async (data: UserUpdateRequest): Promise<User> => {
        const response = await apiClient.put(API.UPDATE_PROFILE, data);
        return response.data;
      },
      onSuccess: (data) => {
        // Update user data in cache
        queryClient.setQueryData(['auth', 'currentUser'], data);
        
        success('Hồ sơ đã được cập nhật thành công');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể cập nhật hồ sơ');
        throw err;
      },
    });
  };

  // Kiểm tra xem có token không để xác định trạng thái đăng nhập
  const isAuthenticated = !!getToken();

  return {
    useGetCurrentUser,
    useLogin,
    useRegister,
    useLogout,
    useRequestPasswordReset,
    useUpdatePassword,
    useUpdateProfile,
    isAuthenticated,
  };
};

export default useAuthQuery; 