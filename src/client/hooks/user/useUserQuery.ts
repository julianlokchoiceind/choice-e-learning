'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { AxiosError } from 'axios';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
// Remove direct useToast import as we're using QueryProvider for toasts
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';
import { 
  User, 
  UserProfile, 
  UserPreferences, 
  UpdatePreferencesInput 
} from '@/shared/types/user';

/**
 * API endpoints for user operations
 */
const API = {
  PROFILE: '/api/dashboard/user/profile',
  ME: '/api/dashboard/user/me',
  PREFERENCES: '/api/dashboard/user/preferences',
  USER_PREFERENCES: (id: string) => `/api/dashboard/user/preferences/${id}`,
  // Login streak is now included in the ME endpoint
};

/**
 * Hook for user profile data operations using React Query
 * 
 * Provides functions for fetching and updating user profile information
 * and managing user preferences with proper loading, error, and success state.
 * 
 * @returns Object containing React Query hooks for user operations
 * 
 * @example
 * // Fetch current user profile
 * const { data, isLoading, error } = useGetUserProfile();
 * 
 * @example
 * // Update user profile
 * const { mutate, isLoading } = useUpdateUserProfile();
 * mutate({ name: 'New Name', bio: 'Updated bio' });
 * 
 * @example
 * // Update user preferences
 * const { mutate } = useUpdateUserPreferences();
 * mutate({ theme: 'dark', emailNotifications: false });
 */
export const useUserQuery = () => {
  const queryClient = useQueryClient();
  // Use QueryProvider's toast system via meta
  const { showErrorToast } = useQueryUtils();
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();

  /**
   * Fetch current user profile data
   * 
   * @param options - Additional React Query options
   * @returns Query result with user profile data, loading state, and error
   */
  const useGetUserProfile = (
    options?: UseQueryOptions<UserProfile, Error, UserProfile, string[]>
  ) => {
    return useQuery({
      queryKey: ['user', 'profile'],
      queryFn: async (): Promise<UserProfile> => {
        const response = await apiRequest.get<{data: UserProfile}>(API.PROFILE);
        if (!response || !response.data) {
          throw new Error('Failed to fetch user profile');
        }
        return response.data.data;
      },
      ...options
    });
  };

  /**
   * Fetch current user data (lightweight version)
   * 
   * @param options - Additional React Query options
   * @returns Query result with user data, loading state, and error
   */
  const useGetCurrentUser = (
    options?: UseQueryOptions<User, Error, User, string[]>
  ) => {
    return useQuery({
      queryKey: ['user', 'current'],
      queryFn: async (): Promise<User> => {
        const response = await apiRequest.get<{data: User}>(API.ME);
        if (!response || !response.data) {
          throw new Error('Failed to fetch current user');
        }
        return response.data.data;
      },
      ...options
    });
  };

  /**
   * Fetch user preferences
   * 
   * @param options - Additional React Query options
   * @returns Query result with user preferences, loading state, and error
   */
  const useGetUserPreferences = (
    options?: UseQueryOptions<UserPreferences, Error, UserPreferences, string[]>
  ) => {
    return useQuery({
      queryKey: ['user', 'preferences'],
      queryFn: async (): Promise<UserPreferences> => {
        const response = await apiRequest.get<{data: UserPreferences}>(API.PREFERENCES);
        if (!response || !response.data) {
          throw new Error('Failed to fetch user preferences');
        }
        return response.data.data;
      },
      ...options
    });
  };

  /**
   * Fetch user login streak
   * 
   * @param options - Additional React Query options
   * @returns Query result with user login streak (number), loading state, and error
   */
  const useGetUserLoginStreak = () => {
    // Get session data for user ID
    const { data: session, status } = useSession();
    
    // Check authentication status - wait for session to be fully loaded
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['userLoginStreak', session?.user?.id],
      // Only enable the query when authentication is confirmed
      enabled: isAuthenticated && !isLoading && !!session?.user?.id,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      queryFn: async (): Promise<number> => {
        try {
          // Double-check authentication status for safety
          if (!session?.user?.id) {
            console.warn('User ID missing for login streak query');
            throw new Error('User ID required to fetch login streak');
          }
          
          // Get user login streak from API
          const response = await apiRequest.get<{streak: number}>(`/api/users/${session.user.id}/login-streak`);
          if (!response || !response.data) {
            return 0; // Return default value if no response
          }
          return response.data.streak || 0;
        } catch (error) {
          console.error('Error fetching user login streak:', error);
          // Return a default value of 0 instead of throwing to prevent UI disruption
          return 0;
        }
      },
      // Provide a fallback value if the query fails
      placeholderData: 0,
    });  
  };

  /**
   * Update user profile information
   * 
   * @returns Mutation function and state for updating user profile
   */
  const useUpdateUserProfile = () => {
    return useMutation({
      mutationFn: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiRequest.put<{data: UserProfile}>(API.PROFILE, data);
        if (!response || !response.data) {
          throw new Error('Failed to update profile: No response');
        }
        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate user profile and current user queries
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        return data;
      },
      onError: (error: unknown) => {
        const apiError = error as ApiRequestError;
        showErrorToast(apiError, 'Failed to update profile');
        throw apiError;
      },
      meta: {
        successToast: 'Profile updated successfully',
        errorToast: 'Failed to update profile'
      }
    });
  };

  /**
   * Update user preferences
   * 
   * @returns Mutation function and state for updating user preferences
   */
  const useUpdateUserPreferences = () => {
    return useMutation({
      mutationFn: async (data: UpdatePreferencesInput): Promise<UserPreferences> => {
        const response = await apiRequest.put<{data: UserPreferences}>(API.PREFERENCES, data);
        if (!response || !response.data) {
          throw new Error('Failed to update preferences: No response');
        }
        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate user preferences query
        queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] });
        return data;
      },
      onError: (error: unknown) => {
        const apiError = error as ApiRequestError;
        showErrorToast(apiError, 'Failed to update preferences');
        throw apiError;
      },
      meta: {
        successToast: 'Preferences updated successfully',
        errorToast: 'Failed to update preferences'
      },
    });
  };

  /**
   * Combined hook for user profile operations
   * 
   * Provides access to user data with associated operations in one hook
   * 
   * @returns Object with user data and operations
   */
  const useUser = () => {
    const { 
      data: user,
      isLoading: isUserLoading,
      error: userError
    } = useGetCurrentUser();

    const { 
      data: preferences,
      isLoading: isPreferencesLoading,
      error: preferencesError
    } = useGetUserPreferences({
      enabled: !!user
    } as UseQueryOptions<UserPreferences, Error, UserPreferences, string[]>);

    const updateProfile = useUpdateUserProfile();
    const updatePreferences = useUpdateUserPreferences();

    return {
      user,
      preferences,
      isLoading: isUserLoading || isPreferencesLoading,
      error: userError || preferencesError,
      updateUserProfile: updateProfile.mutate,
      isUpdatingProfile: updateProfile.isPending,
      updateUserPreferences: updatePreferences.mutate,
      isUpdatingPreferences: updatePreferences.isPending
    };
  };

  return {
    useGetUserProfile,
    useGetCurrentUser,
    useGetUserPreferences,
    useGetUserLoginStreak,
    useUpdateUserProfile,
    useUpdateUserPreferences,
    useUser
  };
};

export default useUserQuery; 