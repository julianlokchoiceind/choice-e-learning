'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { UserCourseStats } from '@/shared/types/courses/course';
import { UserAchievement } from '@/shared/types/achievement';
import { EnrolledCourse } from '@/shared/types/courses/course';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { useQueryOptimizer } from '@/client/hooks/common';

/**
 * Custom hook for dashboard-related queries using React Query
 * 
 * This hook provides optimized queries for dashboard data with:
 * - Proper cache configuration based on data volatility
 * - Select functions to minimize re-renders
 * - Error handling
 * - Prefetching support
 */
const useDashboardQuery = () => {
  const queryClient = useQueryClient();
  const { getQueryOptions } = useQueryOptimizer();
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();
  
  // API endpoints
  const API = {
    USER_STATS: '/api/dashboard/stats',
    ENROLLED_COURSES: '/api/dashboard/courses/enrolled',
    USER_ACHIEVEMENTS: '/api/dashboard/achievements',
  };
  
  /**
   * Get user statistics like completed courses, lessons, etc.
   * Uses DYNAMIC data lifetime as user stats may change frequently
   */
  const useGetUserStats = () => {
    // Get session data for user ID
    const { data: session, status } = useSession();
    
    // Check authentication status - wait for session to be fully loaded
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    // We'll use a standard select function instead of getSelectFunction due to type issues
    const selectStats = (data: UserCourseStats): UserCourseStats => {
      if (!data) return data;
      
      return {
        coursesCompleted: data.coursesCompleted,
        lessonsCompleted: data.lessonsCompleted,
        totalHoursLearned: data.totalHoursLearned,
        currentStreak: data.currentStreak
      };
    };
    
    return useQuery({
      queryKey: ['userStats', session?.user?.id],
      // Only enable the query when authentication is confirmed
      enabled: isAuthenticated && !isLoading && !!session?.user?.id,
      queryFn: async (): Promise<UserCourseStats> => {
        try {
          // Double-check authentication status for safety
          if (!session?.user?.id) {
            console.warn('User ID missing for user stats query');
            throw new Error('User ID required to fetch stats');
          }
          
          // Extract userId from session (safe to access now)
          // TypeScript safety: session and session.user are guaranteed to exist here
          const userId = session!.user!.id;
          
          // Add userId as query parameter
          const url = `${API.USER_STATS}?userId=${userId}`;
          console.log(`Fetching user stats from: ${url}`);
          
          const response = await apiRequest.get<{success: boolean; stats?: UserCourseStats; error?: string}>(url);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to fetch stats: No response');
          }
          
          // Improved error handling with debugging
          if (!response.data || !response.data.success) {
            console.error('Stats API error:', response.data);
            throw new Error(response.data?.error || 'Failed to fetch stats');
          }
          
          if (!response.data.stats) {
            console.warn('Stats API returned empty stats object');
            // Return default empty stats instead of failing
            return {
              coursesCompleted: 0,
              lessonsCompleted: 0, 
              totalHoursLearned: 0,
              currentStreak: 0
            };
          }
          
          return response.data.stats;
        } catch (error: unknown) {
          // Xử lý lỗi từ useApiRequest
          const apiError = error as { response?: { data?: { error?: string } } };
          console.error('User stats fetch error:', apiError?.response?.data);
          throw new Error(apiError?.response?.data?.error || 'Failed to fetch user stats');
        }
      },
      // Apply DYNAMIC data lifetime options with select function
      ...getQueryOptions('DYNAMIC'),
      select: selectStats,
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
    });
  };

  /**
   * Get user's enrolled courses with progress information
   * Uses STANDARD data lifetime as course progress changes at moderate frequency
   */
  const useGetEnrolledCourses = () => {
    // Get session data for user ID
    const { data: session, status } = useSession();
    
    // Check authentication status - wait for session to be fully loaded
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['enrolledCourses', session?.user?.id],
      // Only enable the query when authentication is confirmed
      enabled: isAuthenticated && !isLoading && !!session?.user?.id,
      queryFn: async (): Promise<EnrolledCourse[]> => {
        try {
          // Double-check authentication status for safety
          if (!session?.user?.id) {
            console.warn('User ID missing for enrolled courses query');
            throw new Error('User ID required to fetch enrolled courses');
          }
          
          // Get enrolled courses from API
          console.log('Fetching enrolled courses for user:', session!.user!.id);
          const response = await apiRequest.get<{success: boolean; courses?: EnrolledCourse[]; error?: string}>(API.ENROLLED_COURSES);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to fetch enrolled courses: No response');
          }
          
          // Improved error handling
          if (!response.data || !response.data.success) {
            console.error('Enrolled courses API error:', response.data);
            throw new Error(response.data?.error || 'Failed to fetch enrolled courses');
          }
          
          // Handle empty courses array gracefully
          if (!response.data.courses || !Array.isArray(response.data.courses)) {
            console.warn('Enrolled courses API returned invalid courses data');
            return []; // Return empty array instead of failing
          }
          
          console.log('Enrolled courses response:', response.data.courses);
          return response.data.courses;
        } catch (error: unknown) {
          // Xử lý lỗi từ useApiRequest
          const apiError = error as { response?: { data?: { message?: string } } };
          console.error('Enrolled courses fetch error:', apiError?.response?.data);
          throw new Error(apiError?.response?.data?.message || 'Failed to fetch enrolled courses');
        }
      },
      // Apply STANDARD data lifetime options
      ...getQueryOptions('STANDARD'),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
  };

  /**
   * Get user achievements
   * Uses STANDARD data lifetime as achievements change at moderate frequency
   */
  const useGetUserAchievements = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['userAchievements', session?.user?.id],
      // Only enable the query when authentication is confirmed
      enabled: isAuthenticated && !isLoading && !!session?.user?.id,
      queryFn: async (): Promise<UserAchievement[]> => {
        try {
          // Double-check authentication status for safety
          if (!session?.user?.id) {
            console.warn('User ID missing for achievements query');
            throw new Error('User ID required to fetch achievements');
          }
          
          // API endpoint already gets userId from session
          console.log(`Fetching user achievements for user ID: ${session!.user!.id}`);
          const response = await apiRequest.get<{success: boolean; achievements?: UserAchievement[]; error?: string}>(API.USER_ACHIEVEMENTS);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to fetch user achievements: No response');
          }
          
          // Improved error handling
          if (!response.data || !response.data.success) {
            console.error('Achievements API error:', response.data);
            throw new Error(response.data?.error || 'Failed to fetch user achievements');
          }
          
          // Handle empty achievements array gracefully
          if (!response.data.achievements || !Array.isArray(response.data.achievements)) {
            console.warn('Achievements API returned invalid data');
            return []; // Return empty array instead of failing
          }
          
          console.log('User achievements response:', response.data.achievements);
          return response.data.achievements;
        } catch (error: unknown) {
          // Xử lý lỗi từ useApiRequest
          const apiError = error as { response?: { data?: { message?: string } } };
          console.error('User achievements fetch error:', apiError?.response?.data);
          throw new Error(apiError?.response?.data?.message || 'Failed to fetch user achievements');
        }
      },
      // Apply STANDARD data lifetime options
      ...getQueryOptions('STANDARD'),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
    });
  };
  
  /**
   * Prefetch dashboard data for quick loading
   * Call this function when user is likely to visit dashboard soon
   */
  const prefetchDashboardData = () => {
    // Prefetch all dashboard data
    queryClient.prefetchQuery({
      queryKey: ['userStats'],
      queryFn: async (): Promise<UserCourseStats> => {
        const response = await apiRequest.get<{stats: UserCourseStats}>(API.USER_STATS);
        if (!response || !response.data) {
          throw new Error('Failed to prefetch user stats');
        }
        return response.data.stats;
      },
      ...getQueryOptions('DYNAMIC')
    });
    
    queryClient.prefetchQuery({
      queryKey: ['enrolledCourses'],
      queryFn: async (): Promise<EnrolledCourse[]> => {
        const response = await apiRequest.get<{courses: EnrolledCourse[]}>(API.ENROLLED_COURSES);
        if (!response || !response.data) {
          throw new Error('Failed to prefetch enrolled courses');
        }
        return response.data.courses;
      },
      ...getQueryOptions('STANDARD')
    });
  };

  return {
    useGetUserStats,
    useGetEnrolledCourses,
    useGetUserAchievements,
    prefetchDashboardData
  };
};

export default useDashboardQuery; 