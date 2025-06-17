/**
 * React Query hooks for quiz management
 * Provides CRUD operations for quizzes with caching and optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { 
  Quiz, 
  Question,
  CreateQuizData, 
  UpdateQuizData,
  CreateQuestionData,
  UpdateQuestionData,
  QuizFilter
} from '@/shared/types/quiz';

/**
 * Quiz query hooks factory - consistent with other admin modules
 * @param isAdmin Whether to use admin API endpoints
 * @returns Object containing all quiz query hooks
 */
export const useQuizQuery = (isAdmin = true) => {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  
  /**
   * Hook to get all quizzes with server-side filtering
   */
  const useGetQuizzes = (filters?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive';
    courseId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const queryKey = ['quizzes', filters];
    
    return useQuery({
      queryKey,
      queryFn: async () => {
        const params = new URLSearchParams();
        
        if (filters?.search) params.append('search', filters.search);
        if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters?.courseId) params.append('courseId', filters.courseId);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.sortBy) params.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
        
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.get(`${baseUrl}?${params.toString()}`);
        
        if (!response || !response.data) {
          throw new Error('Failed to fetch quizzes: No data returned');
        }
        
        // Handle standard API response structure: { success: true, data: quizzes, meta?: pagination }
        return response.data?.data || response.data || [];
      },
      staleTime: 5 * 60 * 1000, // 5 minutes - consistent with other modules
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    });
  };
  
  /**
   * Hook to get a single quiz
   */
  const useGetQuiz = (quizId: string) => {
    return useQuery({
      queryKey: ['quiz', quizId],
      queryFn: async () => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.get(`${baseUrl}/${quizId}`);
        
        if (!response || !response.data) {
          throw new Error('Failed to fetch quiz: No data returned');
        }
        
        return response.data?.data || response.data || null;
      },
      enabled: !!quizId,
      staleTime: 5 * 60 * 1000
    });
  };
  
  /**
   * Hook to create a new quiz - consistent with other modules
   */
  const useCreateQuiz = () => {
    return useMutation({
      mutationFn: async (data: CreateQuizData) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.post(baseUrl, data);
        
        if (!response || !response.data) {
          throw new Error('Failed to create quiz: No data returned');
        }
        
        return response.data?.data || response.data;
      },
      onSuccess: () => {
        // Simple invalidation pattern - consistent with other modules
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['courses'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Quiz created successfully',
        errorToast: 'Failed to create quiz'
      }
    });
  };
  
  /**
   * Hook to update a quiz - consistent with other modules
   */
  const useUpdateQuiz = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateQuizData }) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.put(`${baseUrl}/${id}`, data);
        
        if (!response || !response.data) {
          throw new Error('Failed to update quiz: No data returned');
        }
        
        return response.data?.data || response.data;
      },
      onSuccess: (_, variables) => {
        // Invalidate specific quiz and list - consistent pattern
        queryClient.invalidateQueries({ queryKey: ['quiz', variables.id] });
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['courses'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Quiz updated successfully',
        errorToast: 'Failed to update quiz'
      }
    });
  };
  
  /**
   * Hook to delete a quiz - consistent with other modules
   */
  const useDeleteQuiz = () => {
    return useMutation({
      mutationFn: async (quizId: string) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        return await apiRequest.delete(`${baseUrl}/${quizId}`);
      },
      onSuccess: (_, quizId) => {
        // Remove specific quiz cache and invalidate lists - consistent pattern
        queryClient.removeQueries({ queryKey: ['quiz', quizId] });
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['courses'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Quiz deleted successfully',
        errorToast: 'Failed to delete quiz'
      }
    });
  };
  
  /**
   * Hook to bulk delete quizzes - consistent with other modules
   */
  const useBulkDeleteQuizzes = () => {
    return useMutation({
      mutationFn: async (quizIds: string[]) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.post(`${baseUrl}/bulk-delete`, { quizIds });
        
        if (!response || !response.data) {
          throw new Error('Failed to delete quizzes: No data returned');
        }
        
        return response.data;
      },
      onSuccess: (_, deletedIds) => {
        // Remove individual quiz caches
        deletedIds.forEach(id => {
          queryClient.removeQueries({ queryKey: ['quiz', id] });
        });
        
        // Invalidate all quiz-related queries - consistent pattern
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['courses'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Quizzes deleted successfully',
        errorToast: 'Failed to delete quizzes'
      }
    });
  };
  
  return {
    useGetQuizzes,
    useGetQuiz,
    useCreateQuiz,
    useUpdateQuiz,
    useDeleteQuiz,
    useBulkDeleteQuizzes
  };
}

/**
 * Quiz questions query hook factory - consistent with other modules
 * @param quizId Quiz ID to manage questions for
 * @param isAdmin Whether to use admin endpoints
 * @returns Object containing all quiz questions query hooks
 */
export function useQuizQuestionsQuery(quizId: string, isAdmin = true) {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  
  const queryKey = ['quiz-questions', quizId];
  
  /**
   * Hook to get quiz questions
   */
  const useGetQuizQuestions = () => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.get(`${baseUrl}/${quizId}/questions`);
        
        if (!response || !response.data) {
          throw new Error('Failed to fetch questions: No data returned');
        }
        
        return response.data?.data || response.data || [];
      },
      enabled: !!quizId,
      staleTime: 5 * 60 * 1000
    });
  };
  
  /**
   * Hook to create a new question - consistent with other modules
   */
  const useCreateQuestion = () => {
    return useMutation({
      mutationFn: async (data: CreateQuestionData) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.post(`${baseUrl}/${quizId}/questions`, data);
        
        if (!response || !response.data) {
          throw new Error('Failed to create question: No data returned');
        }
        
        return response.data?.data || response.data;
      },
      onSuccess: () => {
        // Simple invalidation pattern
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Question created successfully',
        errorToast: 'Failed to create question'
      }
    });
  };
  
  /**
   * Hook to update a question - consistent with other modules
   */
  const useUpdateQuestion = () => {
    return useMutation({
      mutationFn: async ({ questionId, data }: { questionId: string; data: UpdateQuestionData }) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        const response = await apiRequest.put(`${baseUrl}/${quizId}/questions/${questionId}`, data);
        
        if (!response || !response.data) {
          throw new Error('Failed to update question: No data returned');
        }
        
        return response.data?.data || response.data;
      },
      onSuccess: () => {
        // Simple invalidation pattern
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
      },
      meta: {
        successToast: 'Question updated successfully',
        errorToast: 'Failed to update question'
      }
    });
  };
  
  /**
   * Hook to delete a question - consistent with other modules
   */
  const useDeleteQuestion = () => {
    return useMutation({
      mutationFn: async (questionId: string) => {
        const baseUrl = isAdmin ? '/api/admin/quizzes' : '/api/quizzes';
        return await apiRequest.delete(`${baseUrl}/${quizId}/questions/${questionId}`);
      },
      onSuccess: () => {
        // Simple invalidation pattern
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
        queryClient.invalidateQueries({ 
          queryKey: ['quizzes'],
          exact: false 
        });
      },
      meta: {
        successToast: 'Question deleted successfully',
        errorToast: 'Failed to delete question'
      }
    });
  };
  
  return {
    useGetQuizQuestions,
    useCreateQuestion,
    useUpdateQuestion,
    useDeleteQuestion
  };
}

/**
 * Helper hook to get quizzes for a specific course
 * @param courseId Course ID
 * @param isAdmin Whether to use admin endpoints
 * @returns Query result for course quizzes
 */
export function useCourseQuizzes(courseId: string, isAdmin = true) {
  const { useGetQuizzes } = useQuizQuery(isAdmin);
  return useGetQuizzes({ courseId });
}