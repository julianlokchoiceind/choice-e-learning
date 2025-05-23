'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Course, CourseFilter, CourseListItem } from '@/shared/types/courses/course';
import { useToast } from '@/client/hooks/common';

/**
 * React Query hook for managing courses
 */
const useCoursesQuery = (isAdmin = false) => {
  const queryClient = useQueryClient();
  const baseUrl = isAdmin ? '/api/admin/courses' : '/api/courses';

  /**
   * Get courses with optional filtering
   */
  const useGetCourses = (filters: CourseFilter = {}) => {
    return useQuery({
      queryKey: ['courses', filters, isAdmin],
      queryFn: async () => {
        try {
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
          
          const response = await axios.get(`${baseUrl}?${params.toString()}`);
          
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
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch courses');
          }
          throw new Error('An unexpected error occurred');
        }
      }
    });
  };

  /**
   * Get a specific course by ID
   */
  const useGetCourse = (courseId?: string) => {
    return useQuery({
      queryKey: ['course', courseId, isAdmin],
      queryFn: async () => {
        try {
          if (!courseId) return null;
          const response = await axios.get(`${baseUrl}/${courseId}`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch course');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      enabled: !!courseId // Only run query if courseId is provided
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
          const response = await axios.post(`${baseUrl}`, data);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create course');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: () => {
        // Invalidate courses queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['courses'] });
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
          const response = await axios.put(`${baseUrl}/${id}`, data);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update course');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate specific course query and courses list
        queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['courses'] });
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
          const response = await axios.delete(`${baseUrl}/${id}`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete course');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: () => {
        // Invalidate courses queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['courses'] });
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
          const response = await axios.get('/api/courses/topics');
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch course topics');
          }
          throw new Error('An unexpected error occurred');
        }
      }
    });
  };

  /**
   * Enroll in a course
   */
  const useEnrollInCourse = () => {
    // Sử dụng useToast hook để hiển thị thông báo
    const { success: toastSuccess, error: toastError } = useToast();
    
    return useMutation({
      mutationFn: async (courseId: string) => {
        try {
          const response = await axios.post(`/api/courses/${courseId}/enroll`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to enroll in course');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: (_, courseId) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['courses'] });
        queryClient.invalidateQueries({ queryKey: ['course', courseId] });
        queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });
        queryClient.invalidateQueries({ queryKey: ['userProgress'] });
        
        // Show success toast
        toastSuccess('Đăng ký khóa học thành công!');
      },
      onError: (error) => {
        // Show error toast
        toastError(error instanceof Error ? error.message : 'Đăng ký khóa học thất bại');
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