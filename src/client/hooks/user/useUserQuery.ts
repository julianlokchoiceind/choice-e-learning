'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/client/utils/http/api-client';
import { useToast } from '@/client/hooks/common/useToast';
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
  LOGIN_STREAK: '/api/dashboard/user/login-streak',
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
  const { success } = useToast();
  const { showErrorToast } = useQueryUtils();

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
        const response = await apiClient.get(API.PROFILE);
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
        const response = await apiClient.get(API.ME);
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
        const response = await apiClient.get(API.PREFERENCES);
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
  const useGetUserLoginStreak = (
    options?: UseQueryOptions<number, Error, number, string[]>
  ) => {
    return useQuery({
      queryKey: ['user', 'login-streak'],
      queryFn: async (): Promise<number> => {
        const response = await apiClient.get(API.LOGIN_STREAK);
        return response.data.streak || 0;
      },
      ...options
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
        const response = await apiClient.put(API.PROFILE, data);
        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate user profile and current user queries
        queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
        queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
        success('Profile updated successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to update profile');
        throw err;
      },
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
        const response = await apiClient.put(API.PREFERENCES, data);
        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate user preferences query
        queryClient.invalidateQueries({ queryKey: ['user', 'preferences'] });
        success('Preferences updated successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to update preferences');
        throw err;
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