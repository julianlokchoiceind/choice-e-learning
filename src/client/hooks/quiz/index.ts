/**
 * Quiz hooks exports for the Choice E-Learning platform
 */

export * from './useQuizQuery';
export * from './useQuizAttemptQuery';

// Re-export quiz hooks for easy importing
export {
  useQuizQuery,
  useQuizQuestionsQuery,
  useCourseQuizzes
} from './useQuizQuery';

export {
  useQuizAttemptQuery,
  useUserQuizAttempts,
  useCanTakeQuiz
} from './useQuizAttemptQuery';