'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCourseStats } from '@/shared/types/courses/course';
import { UserAchievement } from '@/shared/types/achievement';
import { EnrolledCourse } from '@/shared/types/courses/course';
import axios from 'axios';
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
  
  // API endpoints
  const API = {
    USER_STATS: '/api/users/stats',
    ENROLLED_COURSES: '/api/users/enrolled-courses',
    USER_ACHIEVEMENTS: '/api/users/achievements',
  };
  
  /**
   * Get user statistics like completed courses, lessons, etc.
   * Uses DYNAMIC data lifetime as user stats may change frequently
   */
  const useGetUserStats = () => {
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
      queryKey: ['userStats'],
      queryFn: async (): Promise<UserCourseStats> => {
        try {
          const { data } = await axios.get(API.USER_STATS);
          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      // Apply DYNAMIC data lifetime options with select function
      ...getQueryOptions('DYNAMIC'),
      select: selectStats
    });
  };

  /**
   * Get user's enrolled courses with progress information
   * Uses STANDARD data lifetime as course progress changes at moderate frequency
   */
  const useGetEnrolledCourses = () => {
    return useQuery({
      queryKey: ['enrolledCourses'],
      queryFn: async (): Promise<EnrolledCourse[]> => {
        try {
          const { data } = await axios.get(API.ENROLLED_COURSES);
          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch enrolled courses');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      // Apply STANDARD data lifetime options
      ...getQueryOptions('STANDARD')
    });
  };

  /**
   * Get user's achievements
   * Uses STANDARD data lifetime as achievements change at moderate frequency
   */
  const useGetUserAchievements = () => {
    return useQuery({
      queryKey: ['userAchievements'],
      queryFn: async (): Promise<UserAchievement[]> => {
        try {
          const { data } = await axios.get(API.USER_ACHIEVEMENTS);
          return data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user achievements');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      // Apply STANDARD data lifetime options
      ...getQueryOptions('STANDARD')
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
        const { data } = await axios.get(API.USER_STATS);
        return data;
      },
      ...getQueryOptions('DYNAMIC')
    });
    
    queryClient.prefetchQuery({
      queryKey: ['enrolledCourses'],
      queryFn: async (): Promise<EnrolledCourse[]> => {
        const { data } = await axios.get(API.ENROLLED_COURSES);
        return data;
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