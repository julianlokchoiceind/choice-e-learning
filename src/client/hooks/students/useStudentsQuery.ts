'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/client/utils/http/api-client';
import { useToast } from '@/client/hooks/common/useToast';
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';
import {
  FormattedStudent,
  StudentQuery,
  PaginatedStudentsResponse,
  CreateStudentDTO,
  UpdateStudentDTO
} from '@/shared/types/students/student';

/**
 * API endpoints for student operations
 */
const API = {
  STUDENTS: '/api/admin/students',
  STUDENT: (id: string) => `/api/admin/students/${id}`,
};

/**
 * Hook for student data operations using React Query
 * 
 * Provides functions for fetching and managing student data with proper
 * loading, error, and success state.
 * 
 * @returns Object containing React Query hooks for student operations
 * 
 * @example
 * // Fetch students with pagination and filtering
 * const { data, isLoading, error } = useGetStudents({ page: 1, limit: 10 });
 * 
 * @example
 * // Fetch a specific student by ID
 * const { data, isLoading } = useGetStudentById('student-id');
 * 
 * @example
 * // Create a new student
 * const { mutate, isPending } = useCreateStudent();
 * mutate({ name: 'John Doe', email: 'john@example.com' });
 */
export const useStudentsQuery = () => {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { showErrorToast } = useQueryUtils();

  /**
   * Fetch students with pagination, sorting, and filtering
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Query result with students data, loading state, and error
   */
  const useGetStudents = (params: StudentQuery = {}) => {
    return useQuery({
      queryKey: ['students', params],
      queryFn: async (): Promise<PaginatedStudentsResponse> => {
        // Build URL with query parameters
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
        
        const url = `${API.STUDENTS}?${queryParams.toString()}`;
        const response = await apiClient.get(url);
        return response.data;
      }
    });
  };

  /**
   * Fetch a specific student by ID
   * 
   * @param id - The student ID to fetch
   * @returns Query result with student data, loading state, and error
   */
  const useGetStudentById = (id: string) => {
    return useQuery({
      queryKey: ['students', id],
      queryFn: async (): Promise<FormattedStudent> => {
        const response = await apiClient.get(API.STUDENT(id));
        return response.data.data;
      },
      enabled: !!id
    });
  };

  /**
   * Create a new student
   * 
   * @returns Mutation function and state for creating a student
   */
  const useCreateStudent = () => {
    return useMutation({
      mutationFn: async (data: CreateStudentDTO): Promise<FormattedStudent> => {
        const response = await apiClient.post(API.STUDENTS, data);
        return response.data.data;
      },
      onSuccess: (data) => {
        // Invalidate students list query to refetch
        queryClient.invalidateQueries({ queryKey: ['students'] });
        success('Student created successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to create student');
        throw err;
      },
    });
  };

  /**
   * Update an existing student
   * 
   * @returns Mutation function and state for updating a student
   */
  const useUpdateStudent = () => {
    return useMutation({
      mutationFn: async ({ 
        id, 
        data 
      }: { 
        id: string; 
        data: UpdateStudentDTO 
      }): Promise<FormattedStudent> => {
        const response = await apiClient.patch(API.STUDENT(id), data);
        return response.data.data;
      },
      onSuccess: (data, variables) => {
        // Invalidate both the list and the specific student
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
        success('Student updated successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to update student');
        throw err;
      },
    });
  };

  /**
   * Delete a student
   * 
   * @returns Mutation function and state for deleting a student
   */
  const useDeleteStudent = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        await apiClient.delete(API.STUDENT(id));
      },
      onSuccess: (_, variables) => {
        // Invalidate students list query to refetch
        queryClient.invalidateQueries({ queryKey: ['students'] });
        // Remove the specific student from cache
        queryClient.removeQueries({ queryKey: ['students', variables] });
        success('Student deleted successfully');
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to delete student');
        throw err;
      },
    });
  };

  return {
    useGetStudents,
    useGetStudentById,
    useCreateStudent,
    useUpdateStudent,
    useDeleteStudent
  };
};

export default useStudentsQuery; 