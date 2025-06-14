'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
// Remove direct useToast import as we're using QueryProvider for toasts
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';
import { 
  Lesson,
  LessonWithContent,
  LessonInput
} from '@/shared/types/lessons/lesson';

/**
 * API endpoints for lesson operations
 */
const API = {
  LESSONS: '/api/admin/lessons',
  LESSON: (id: string) => `/api/admin/lessons/${id}`,
  COURSE_LESSONS: (courseId: string) => `/api/courses/${courseId}/lessons`,
};

/**
 * Hook for lesson data operations using React Query
 * 
 * Provides functions for fetching, updating, and deleting lessons
 * with proper loading, error handling, and success notifications.
 * Note: Lesson creation is handled through course curriculum management.
 * 
 * @returns Object containing React Query hooks for lesson operations
 * 
 * @example
 * // Fetch all lessons
 * const { data, isLoading, error } = useGetLessons();
 * 
 * @example
 * // Fetch a specific lesson
 * const { data, isLoading, error } = useGetLesson('lesson-id');
 */
export const useLessonsQuery = () => {
  const queryClient = useQueryClient();
  // Use QueryProvider's toast system via meta
  const { showErrorToast } = useQueryUtils();
  // Initialize useApiRequest hook
  const apiRequest = useApiRequest();

  /**
   * Fetch all lessons with optional filtering
   * 
   * @param courseId - Optional course ID to filter lessons by course
   * @param options - Additional React Query options
   * @returns Query result with lessons data, loading state, and error
   */
  const useGetLessons = (
    courseId?: string,
    filters?: any,
    options?: UseQueryOptions<any, Error, any, (string | undefined | any)[]>
  ) => {
    // Get session data for authentication status
    const { data: session, status } = useSession();
    
    // Check authentication status
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['lessons', courseId, filters],
      queryFn: async () => {
        try {
          // Build query params
          const params = new URLSearchParams();
          
          if (courseId) {
            params.append('courseId', courseId);
          }
          
          // Add filter params if provided
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== '') {
                params.append(key, String(value));
              }
            });
          }
          
          const url = `${API.LESSONS}?${params.toString()}`;
          const response = await apiRequest.get(url);
          
          // Return the full response with data and meta
          return response?.data || { data: [], meta: null };
        } catch (error) {
          console.error('Error fetching lessons:', error);
          throw error;
        }
      },
      // Enable query when session is ready and authenticated
      enabled: isAuthenticated && !isLoading && (options?.enabled !== false),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Keep data fresh
      staleTime: 0, // Consider data stale immediately
      // Suppress global error toast as the component handles errors
      meta: {
        suppressErrorToast: true,
        ...options?.meta
      },
      ...options
    });
  };

  /**
   * Fetch a specific lesson by ID
   * 
   * @param id - The ID of the lesson to fetch
   * @param options - Additional React Query options
   * @returns Query result with lesson data, loading state, and error
   */
  const useGetLesson = (
    id: string,
    options?: UseQueryOptions<LessonWithContent, Error, LessonWithContent, (string)[]>
  ) => {
    // Get session data for authentication status
    const { data: session, status } = useSession();
    
    // Check authentication status
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['lessons', id],
      queryFn: async (): Promise<LessonWithContent> => {
        try {
          if (!id) {
            throw new Error('Lesson ID is required');
          }
          
          const response = await apiRequest.get(API.LESSON(id));
          
          // Check if the data is nested
          const lessonData = response?.data?.data || response?.data;
          
          return lessonData;
        } catch (error) {
          console.error(`Error fetching lesson ${id}:`, error);
          throw error;
        }
      },
      // Enable query when ID exists, session is ready and authenticated
      enabled: !!id && isAuthenticated && !isLoading && (options?.enabled !== false),
      // Add retry logic for transient errors
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      ...options
    });
  };


  /**
   * Update an existing lesson
   * 
   * @returns Mutation function and state for updating a lesson
   */
  const useUpdateLesson = () => {
    // Create a dedicated apiRequest instance for this mutation
    const updateLessonRequest = useApiRequest<Lesson>();
    
    return useMutation({
      mutationFn: async (params: { id: string; data: Partial<LessonInput> }): Promise<Lesson> => {
        const { id, data } = params;
        const response = await updateLessonRequest.put(API.LESSON(id), data);
        if (!response?.data) throw new Error('Failed to update lesson: No data returned');
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific lesson query and the lessons list
        queryClient.invalidateQueries({ queryKey: ['lessons', data.id] });
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
        // Also invalidate the course-specific lessons list
        if (data.courseId) {
          queryClient.invalidateQueries({ 
            queryKey: ['lessons', data.courseId] 
          });
          // Update the course data too since it might include lesson information
          queryClient.invalidateQueries({ 
            queryKey: ['courses', data.courseId] 
          });
        }
        // Toast handled by QueryProvider meta
        return data;
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to update lesson');
        throw err;
      },
      meta: {
        successToast: 'Lesson updated successfully',
        errorToast: 'Failed to update lesson'
      },
    });
  };

  /**
   * Update a lesson silently (for autosave - no toast notifications)
   * 
   * @returns Mutation function and state for updating a lesson
   */
  const useUpdateLessonSilent = () => {
    // Create a dedicated apiRequest instance for this mutation
    const updateLessonRequest = useApiRequest<Lesson>();
    
    return useMutation({
      mutationFn: async (params: { id: string; data: Partial<LessonInput> }): Promise<Lesson> => {
        const { id, data } = params;
        const response = await updateLessonRequest.put(API.LESSON(id), data);
        if (!response?.data) throw new Error('Failed to update lesson: No data returned');
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific lesson query and the lessons list
        queryClient.invalidateQueries({ queryKey: ['lessons', data.id] });
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
        // Also invalidate the course-specific lessons list
        if (data.courseId) {
          queryClient.invalidateQueries({ 
            queryKey: ['lessons', data.courseId] 
          });
          // Update the course data too since it might include lesson information
          queryClient.invalidateQueries({ 
            queryKey: ['courses', data.courseId] 
          });
        }
        return data;
      },
      onError: (err: ApiRequestError) => {
        console.error('Failed to update lesson:', err);
        throw err;
      },
      // No toast meta for silent updates - autosave shouldn't show notifications
    });
  };

  /**
   * Delete a lesson
   * 
   * @returns Mutation function and state for deleting a lesson
   */
  const useDeleteLesson = () => {
    // Create a dedicated apiRequest instance for this mutation
    const deleteLessonRequest = useApiRequest();
    
    return useMutation({
      mutationFn: async (params: { id: string; courseId?: string }): Promise<void> => {
        const { id } = params;
        await deleteLessonRequest.delete(API.LESSON(id));
      },
      onSuccess: (_data, params) => {
        const { id, courseId } = params;
        
        // Remove the specific lesson query
        queryClient.removeQueries({ queryKey: ['lessons', id] });
        
        // Invalidate all lessons queries to ensure the list refreshes
        // This includes queries with different filters
        queryClient.invalidateQueries({ 
          queryKey: ['lessons'],
          exact: false,
          refetchType: 'active' // Only refetch active queries
        });
        
        // Update course-specific data if courseId is provided
        if (courseId) {
          queryClient.invalidateQueries({ 
            queryKey: ['courses', courseId],
            exact: false
          });
        }
        
        // Invalidate all courses to update lesson counts
        queryClient.invalidateQueries({ 
          queryKey: ['courses'],
          exact: false
        });
        
        // Toast handled by QueryProvider meta
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to delete lesson');
        throw err;
      },
      meta: {
        successToast: 'Lesson deleted successfully',
        errorToast: 'Failed to delete lesson'
      },
    });
  };

  /**
   * Bulk delete lessons
   * 
   * @returns Mutation function and state for bulk deleting lessons
   */
  const useBulkDeleteLessons = () => {
    const bulkDeleteRequest = useApiRequest();
    
    return useMutation({
      mutationFn: async (lessonIds: string[]): Promise<any> => {
        const response = await bulkDeleteRequest.post('/api/admin/lessons/bulk-delete', { lessonIds });
        return response?.data;
      },
      onSuccess: () => {
        // Invalidate all lesson queries to refresh the list
        queryClient.invalidateQueries({ 
          queryKey: ['lessons'],
          exact: false,
          refetchType: 'active'
        });
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to delete lessons');
        throw err;
      },
      meta: {
        successToast: 'Lessons deleted successfully',
        errorToast: 'Failed to delete lessons'
      },
    });
  };

  /**
   * Mark a lesson as completed
   * 
   * @returns Mutation function and state for marking a lesson as completed
   */
  const useMarkLessonComplete = () => {
    // Create a dedicated apiRequest instance for this mutation
    const markCompleteRequest = useApiRequest();
    
    return useMutation({
      mutationFn: async (lessonId: string): Promise<void> => {
        await markCompleteRequest.post(`/api/lessons/${lessonId}/complete`);
      },
      onSuccess: (_data, lessonId) => {
        // Invalidate the lesson and user progress
        queryClient.invalidateQueries({ queryKey: ['lessons', lessonId] });
        queryClient.invalidateQueries({ queryKey: ['userProgress'] });
        // Toast handled by QueryProvider meta
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to mark lesson as completed');
        throw err;
      },
      meta: {
        successToast: 'Lesson marked as completed',
        errorToast: 'Failed to mark lesson as completed'
      },
    });
  };

  return {
    useGetLessons,
    useGetLesson,
    useUpdateLesson,
    useUpdateLessonSilent,
    useDeleteLesson,
    useBulkDeleteLessons,
    useMarkLessonComplete
  };
};

export default useLessonsQuery;
