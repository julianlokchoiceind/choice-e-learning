'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/client/utils/http/api-client';
import { useToast } from '@/client/hooks/common/useToast';
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
  const { success } = useToast();
  const { showErrorToast } = useQueryUtils();

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
    return useQuery({
      queryKey: ['lessons', courseId],
      queryFn: async (): Promise<Lesson[]> => {
        const url = courseId ? API.COURSE_LESSONS(courseId) : API.LESSONS;
        const response = await apiClient.get(url);
        return response.data;
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
    return useQuery({
      queryKey: ['lessons', id],
      queryFn: async (): Promise<LessonWithContent> => {
        const response = await apiClient.get(API.LESSON(id));
        return response.data;
      },
      enabled: !!id, // Only run the query if ID is provided
      ...options
    });
  };

  /**
   * Create a new lesson
   * 
   * @returns Mutation function and state for creating a lesson
   */
  const useCreateLesson = () => {
    return useMutation({
      mutationFn: async (data: CreateLessonParams): Promise<Lesson> => {
        const response = await apiClient.post(API.LESSONS, data);
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
        success('Bài học đã được tạo thành công');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể tạo bài học');
        throw err;
      },
    });
  };

  /**
   * Update an existing lesson
   * 
   * @returns Mutation function and state for updating a lesson
   */
  const useUpdateLesson = () => {
    return useMutation({
      mutationFn: async (params: { id: string; data: Partial<LessonInput> }): Promise<Lesson> => {
        const { id, data } = params;
        const response = await apiClient.put(API.LESSON(id), data);
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
        success('Bài học đã được cập nhật thành công');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể cập nhật bài học');
        throw err;
      },
    });
  };

  /**
   * Delete a lesson
   * 
   * @returns Mutation function and state for deleting a lesson
   */
  const useDeleteLesson = () => {
    return useMutation({
      mutationFn: async (params: { id: string; courseId?: string }): Promise<void> => {
        const { id } = params;
        await apiClient.delete(API.LESSON(id));
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
        success('Bài học đã được xóa thành công');
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Không thể xóa bài học');
        throw err;
      },
    });
  };

  return {
    useGetLessons,
    useGetLesson,
    useCreateLesson,
    useUpdateLesson,
    useDeleteLesson,
  };
};

export default useLessonsQuery; 