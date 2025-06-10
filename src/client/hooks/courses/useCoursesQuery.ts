'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
import { Course, CourseFilter, CourseListItem } from '@/shared/types/courses/course';
// Remove direct useToast import as we're using QueryProvider for toasts

/**
 * React Query hook for managing courses
 */
const useCoursesQuery = (isAdmin = false) => {
  const queryClient = useQueryClient();
  const baseUrl = isAdmin ? '/api/admin/courses' : '/api/courses';
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();

  /**
   * Get courses with optional filtering
   */
  const useGetCourses = (filters: CourseFilter = {}) => {
    // Get session data for authentication status
    const { data: session, status } = useSession();
    
    // Check authentication status for admin routes
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    // Only require authentication for admin routes
    const requiresAuth = isAdmin;
    
    return useQuery({
      queryKey: ['courses', filters, isAdmin],
      queryFn: async () => {
        try {
          // For admin routes, verify authentication
          if (requiresAuth && !isAuthenticated) {
            console.warn('Authentication required for admin course access');
            throw new Error('Authentication required');
          }
          
          // Build query string for filtering
          const params = new URLSearchParams();
          if (filters.search) params.append('search', filters.search);
          if (filters.level) params.append('level', filters.level);
          if (filters.topics && Array.isArray(filters.topics) && filters.topics.length > 0) {
            filters.topics.forEach(topic => params.append('topics', topic));
          }
          if (filters.page) params.append('page', filters.page.toString());
          if (filters.limit) params.append('limit', filters.limit.toString());
          if (filters.sortBy) params.append('sortBy', filters.sortBy);
          if (filters.order) params.append('order', filters.order);
          
          const response = await apiRequest.get<any>(`${baseUrl}?${params.toString()}`);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to fetch courses: No response');
          }
          
          // Handle different response structures for admin vs public API
          if (isAdmin) {
            // Admin API returns: { success: true, courses: [...], meta: { pagination: {...} } }
            return {
              data: response.data?.courses || [],
              meta: response.data?.meta?.pagination || {}
            };
          } else {
            // Public API returns: { success: true, data: [...], meta: {...} }
            return response.data?.data || [];
          }
        } catch (error: unknown) {
          console.error('Error fetching courses:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to fetch courses');
        }
      },
      // Only enable if authentication is not required or if authenticated
      enabled: !requiresAuth || (requiresAuth && isAuthenticated && !isLoading),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Provide placeholder data for better UX
      placeholderData: isAdmin ? { data: [], meta: {} } : []
    });
  };

  /**
   * Get a specific course by ID
   */
  const useGetCourse = (courseId?: string) => {
    // Get session data for authentication status
    const { data: session, status } = useSession();
    
    // Check authentication status for admin routes
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    // Only require authentication for admin routes
    const requiresAuth = isAdmin;
    
    return useQuery({
      queryKey: ['course', courseId, isAdmin],
      queryFn: async () => {
        try {
          if (!courseId) return null;
          
          // For admin routes, verify authentication
          if (requiresAuth && !isAuthenticated) {
            console.warn('Authentication required for admin course access');
            throw new Error('Authentication required');
          }
          
          const response = await apiRequest.get<{data: Course}>(`${baseUrl}/${courseId}`);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error(`Failed to fetch course ${courseId}: No response`);
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error(`Error fetching course ${courseId}:`, error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to fetch course');
        }
      },
      // Only enable if courseId exists and authentication requirements are met
      enabled: !!courseId && (!requiresAuth || (requiresAuth && isAuthenticated && !isLoading)),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
    });
  };

  /**
   * Create a new course (admin only)
   */
  const useCreateCourse = () => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required to create courses');
    }
    
    return useMutation({
      mutationFn: async (data: Partial<Course>) => {
        try {
          const response = await apiRequest.post<{data: Course}>(`${baseUrl}`, data);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to create course: No response');
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error('Error creating course:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to create course');
        }
      },
      onSuccess: () => {
        // Invalidate courses queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Course created successfully',
        errorToast: 'Failed to create course'
      }
    });
  };

  /**
   * Update an existing course (admin only)
   */
  const useUpdateCourse = () => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required to update courses');
    }
    
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
        try {
          const response = await apiRequest.put<{data: Course}>(`${baseUrl}/${id}`, data);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to update course: No response');
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error('Error updating course:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to update course');
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate specific course query and courses list
        queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Course updated successfully',
        errorToast: 'Failed to update course'
      }
    });
  };

  /**
   * Delete a course (admin only)
   */
  const useDeleteCourse = () => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required to delete courses');
    }
    
    return useMutation({
      mutationFn: async (id: string) => {
        try {
          const response = await apiRequest.delete<{data: any}>(`${baseUrl}/${id}`);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to delete course: No response');
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error('Error deleting course:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to delete course');
        }
      },
      onSuccess: () => {
        // Invalidate courses queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['courses'] });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Course deleted successfully',
        errorToast: 'Failed to delete course'
      }
    });
  };

  /**
   * Get topics for courses (for filtering)
   */
  const useGetCourseTopics = () => {
    return useQuery({
      queryKey: ['courseTopics'],
      queryFn: async () => {
        try {
          const response = await apiRequest.get<{data: string[]}>('/api/courses/topics');
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to fetch course topics: No response');
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error('Error fetching course topics:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to fetch course topics');
        }
      }
    });
  };

  /**
   * Enroll in a course
   */
  const useEnrollInCourse = () => {
    // Use QueryClient's default error handling
    return useMutation({
      mutationFn: async (courseId: string) => {
        try {
          const response = await apiRequest.post<{data: any}>(`/api/courses/${courseId}/enroll`);
          
          // Kiểm tra response null/undefined
          if (!response) {
            throw new Error('Failed to enroll in course: No response');
          }
          
          return response.data.data;
        } catch (error: unknown) {
          console.error('Error enrolling in course:', error);
          const apiError = error as ApiRequestError;
          throw new Error(apiError?.message || 'Failed to enroll in course');
        }
      },
      onSuccess: (_, courseId) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
        queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Successfully enrolled in the course',
        errorToast: 'Failed to enroll in the course'
      }
    });
  };

  return {
    useGetCourses,
    useGetCourse,
    useCreateCourse,
    useUpdateCourse,
    useDeleteCourse,
    useGetCourseTopics,
    useEnrollInCourse
  };
};

export default useCoursesQuery; 