'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
// Remove direct useToast import as we're using QueryProvider for toasts
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';
import { 
  Lesson,
  LessonWithContent,
  CreateLessonParams,
  LessonInput
} from '@/shared/types/lessons/lesson';

/**
 * API endpoints for lesson operations
 */
const API = {
  LESSONS: '/api/lessons',
  LESSON: (id: string) => `/api/lessons/${id}`,
  COURSE_LESSONS: (courseId: string) => `/api/courses/${courseId}/lessons`,
};

/**
 * Hook for lesson data CRUD operations using React Query
 * 
 * Provides functions for fetching, creating, updating, and deleting lessons
 * with proper loading, error handling, and success notifications.
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
 * 
 * @example
 * // Create a new lesson
 * const { mutate, isLoading } = useCreateLesson();
 * mutate({ title: 'New Lesson', content: '...', courseId: 'course-id' });
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
    options?: UseQueryOptions<Lesson[], Error, Lesson[], (string | undefined)[]>
  ) => {
    // Get session data for authentication status
    const { data: session, status } = useSession();
    
    // Check authentication status
    const isAuthenticated = status === 'authenticated' && !!session?.user;
    const isLoading = status === 'loading';
    
    return useQuery({
      queryKey: ['lessons', courseId],
      queryFn: async (): Promise<Lesson[]> => {
        try {
          const url = courseId ? API.COURSE_LESSONS(courseId) : API.LESSONS;
          const response = await apiRequest.get(url);
          return response?.data || [];
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
      // Provide empty array as placeholder data for better UX
      placeholderData: [],
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
          return response?.data;
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
   * Create a new lesson
   * 
   * @returns Mutation function and state for creating a lesson
   */
  const useCreateLesson = () => {
    // Create a dedicated apiRequest instance for this mutation
    const createLessonRequest = useApiRequest<Lesson>();
    
    return useMutation({
      mutationFn: async (data: CreateLessonParams): Promise<Lesson> => {
        const response = await createLessonRequest.post(API.LESSONS, data);
        if (!response?.data) throw new Error('Failed to create lesson: No data returned');
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate lessons query to refetch the list
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
        showErrorToast(err, 'Failed to create lesson');
        throw err;
      },
      meta: {
        successToast: 'Lesson created successfully',
        errorToast: 'Failed to create lesson'
      }
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
        // Remove lesson from cache and invalidate lessons list
        queryClient.removeQueries({ queryKey: ['lessons', id] });
        queryClient.invalidateQueries({ queryKey: ['lessons'] });
        // Also invalidate the course-specific lessons list
        if (courseId) {
          queryClient.invalidateQueries({ 
            queryKey: ['lessons', courseId] 
          });
          // Update the course data too since it might include lesson information
          queryClient.invalidateQueries({ 
            queryKey: ['courses', courseId] 
          });
        }
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
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
    useMarkLessonComplete
  };
};

export default useLessonsQuery;
