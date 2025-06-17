/**
 * Quiz types exports for the Choice E-Learning platform
 */

export * from './quiz';

// Re-export all quiz-related types for easy importing
export type {
  Quiz,
  Question,
  QuizAttempt,
  QuestionType,
  CreateQuizData,
  UpdateQuizData,
  CreateQuestionData,
  UpdateQuestionData,
  CreateQuizAttemptData,
  UpdateQuizAttemptData,
  QuizAnswers,
  QuizStats,
  QuestionStats,
  QuizFilter,
  QuizAttemptFilter,
  QuizSession,
  QuizConfig
} from './quiz';