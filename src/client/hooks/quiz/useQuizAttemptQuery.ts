/**
 * React Query hooks for quiz attempts management
 * Provides quiz taking and progress tracking functionality
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '@/client/hooks/common/useApiRequest';
import { QuizAttempt, QuizAnswers } from '@/shared/types/quiz';

// Quiz attempt submission data
interface SubmitQuizAttemptData {
  answers: QuizAnswers;
  timeSpent: number;
  completed?: boolean;
}

// Quiz attempt result
interface QuizAttemptResult extends Omit<QuizAttempt, 'answers'> {
  passed: boolean;
  passingScore: number;
  attemptsUsed: number;
  maxAttempts: number;
  answers: QuizAnswers;
}

// User's quiz attempts summary
interface UserQuizAttempts {
  attempts: QuizAttemptResult[];
  attemptsUsed: number;
  maxAttempts: number;
  canRetake: boolean;
  bestScore: number;
  hasPassedQuiz: boolean;
}

/**
 * Quiz attempts query hook factory
 * @param quizId Quiz ID to manage attempts for
 * @returns Object containing all quiz attempt query hooks
 */
export function useQuizAttemptQuery(quizId: string) {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  
  const queryKey = ['quiz-attempts', quizId];
  
  /**
   * Hook to get user's attempts for a quiz
   */
  const useGetQuizAttempts = () => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        const response = await apiRequest.get<UserQuizAttempts>(`/api/quizzes/${quizId}/attempt`);
        
        // Extract data from API response structure: { success: true, data: attempts }
        return response?.data?.data || {
          attempts: [],
          attemptsUsed: 0,
          maxAttempts: 3,
          canRetake: true,
          bestScore: 0,
          hasPassedQuiz: false
        };
      },
      enabled: !!quizId
    });
  };
  
  /**
   * Hook to submit a quiz attempt
   */
  const useSubmitQuizAttempt = () => {
    return useMutation({
      mutationFn: async (data: SubmitQuizAttemptData) => {
        const response = await apiRequest.post<QuizAttemptResult>(`/api/quizzes/${quizId}/attempt`, data);
        
        // Extract data from API response structure: { success: true, data: attempt }
        return response?.data?.data || null;
      },
      onSuccess: (newAttempt) => {
        if (!newAttempt) return;
        // Update the attempts cache
        queryClient.setQueryData<UserQuizAttempts>(queryKey, (oldData) => {
          if (!oldData) {
            return {
              attempts: [newAttempt],
              attemptsUsed: 1,
              maxAttempts: newAttempt.maxAttempts,
              canRetake: 1 < newAttempt.maxAttempts,
              bestScore: newAttempt.score,
              hasPassedQuiz: newAttempt.passed
            };
          }
          
          const updatedAttempts = [...oldData.attempts, newAttempt];
          return {
            ...oldData,
            attempts: updatedAttempts,
            attemptsUsed: updatedAttempts.length,
            canRetake: updatedAttempts.length < newAttempt.maxAttempts,
            bestScore: Math.max(oldData.bestScore, newAttempt.score),
            hasPassedQuiz: oldData.hasPassedQuiz || newAttempt.passed
          };
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        queryClient.invalidateQueries({ queryKey: ['course-progress'] });
      },
      meta: {
        successToast: (data: QuizAttemptResult) => 
          data.passed 
            ? `Congratulations! You passed with ${data.score}%` 
            : `Quiz completed. Score: ${data.score}%`,
        errorToast: 'Failed to submit quiz attempt'
      }
    });
  };
  
  return {
    useGetQuizAttempts,
    useSubmitQuizAttempt
  };
}

/**
 * Hook to get all quiz attempts for current user (across all quizzes)
 */
export function useUserQuizAttempts() {
  const apiRequest = useApiRequest();
  
  return useQuery({
    queryKey: ['user-quiz-attempts'],
    queryFn: () => apiRequest.get<QuizAttemptResult[]>('/api/user/quiz-attempts')
  });
}

/**
 * Helper hook to check if user can take a quiz
 * @param quizId Quiz ID
 * @returns Query result with attempt info
 */
export function useCanTakeQuiz(quizId: string) {
  const { useGetQuizAttempts } = useQuizAttemptQuery(quizId);
  const { data: attemptData, isLoading, error } = useGetQuizAttempts();
  
  return {
    canTake: attemptData?.canRetake ?? true,
    attemptsUsed: attemptData?.attemptsUsed ?? 0,
    maxAttempts: attemptData?.maxAttempts ?? 3,
    hasPassedQuiz: attemptData?.hasPassedQuiz ?? false,
    bestScore: attemptData?.bestScore ?? 0,
    isLoading,
    error
  };
}