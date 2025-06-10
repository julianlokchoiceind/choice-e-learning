'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
// Remove direct useToast import as we're using QueryProvider for toasts
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
  // Use QueryProvider's toast system via meta
  const { showErrorToast } = useQueryUtils();
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();

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
        try {
          // Sử dụng params object thay vì URLSearchParams
          const queryParams: Record<string, string | number> = {};
          if (params.search) queryParams.search = params.search;
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;
          if (params.sortBy) queryParams.sortBy = params.sortBy;
          if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
          
          const response = await apiRequest.get(API.STUDENTS, { params: queryParams });
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error('Error fetching students: Empty response');
            throw new Error('Failed to fetch students: No data returned');
          }
          
          return response.data;
        } catch (error) {
          console.error('Error fetching students:', error);
          throw error;
        }
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
        try {
          if (!id) {
            throw new Error('Student ID is required');
          }
          
          const response = await apiRequest.get(API.STUDENT(id));
          
          // Kiểm tra response null/undefined
          if (!response || !response.data || !response.data.data) {
            console.error(`Error fetching student ${id}: Empty response`);
            throw new Error('Failed to fetch student: No data returned');
          }
          
          return response.data.data;
        } catch (error) {
          console.error(`Error fetching student ${id}:`, error);
          throw error;
        }
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
        try {
          const response = await apiRequest.post(API.STUDENTS, data);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data || !response.data.data) {
            console.error('Error creating student: Empty response');
            throw new Error('Failed to create student: No data returned');
          }
          
          return response.data.data;
        } catch (error) {
          console.error('Error creating student:', error);
          throw error;
        }
      },
      onSuccess: (data) => {
        // Invalidate students list query to refetch
        queryClient.invalidateQueries({ queryKey: ['students'] });
        return data;
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to create student');
        throw err;
      },
      meta: {
        successToast: 'Student created successfully',
        errorToast: 'Failed to create student'
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
        try {
          const response = await apiRequest.patch(API.STUDENT(id), data);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data || !response.data.data) {
            console.error(`Error updating student ${id}: Empty response`);
            throw new Error('Failed to update student: No data returned');
          }
          
          return response.data.data;
        } catch (error) {
          console.error(`Error updating student ${id}:`, error);
          throw error;
        }
      },
      onSuccess: (data, variables) => {
        // Invalidate both the list and the specific student
        queryClient.invalidateQueries({ queryKey: ['students'] });
        queryClient.invalidateQueries({ queryKey: ['students', variables.id] });
        return data;
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to update student');
        throw err;
      },
      meta: {
        successToast: 'Student updated successfully',
        errorToast: 'Failed to update student'
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
        try {
          await apiRequest.delete(API.STUDENT(id));
        } catch (error) {
          console.error(`Error deleting student ${id}:`, error);
          throw error;
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate students list query to refetch
        queryClient.invalidateQueries({ queryKey: ['students'] });
        // Remove the specific student from cache
        queryClient.removeQueries({ queryKey: ['students', variables] });
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to delete student');
        throw err;
      },
      meta: {
        successToast: 'Student deleted successfully',
        errorToast: 'Failed to delete student'
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