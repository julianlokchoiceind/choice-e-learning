/**
 * Quiz types for the Choice E-Learning platform
 */

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  timeLimit?: number; // Time limit in minutes
  passingScore: number; // Passing score percentage
  maxAttempts: number; // Maximum attempts allowed
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional based on include)
  course?: {
    id: string;
    title: string;
  };
  questions?: Question[];
  attempts?: QuizAttempt[];
  _count?: {
    questions: number;
    attempts: number;
  };
}

export interface Question {
  id: string;
  title: string;
  type: QuestionType;
  content: string; // Question text
  options: string[]; // Array of options for multiple choice
  correctAnswer: string; // Correct answer(s)
  explanation?: string; // Explanation for the answer
  points: number;
  order: number;
  quizId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional)
  quiz?: Quiz;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: string; // JSON string of answers
  score: number; // Score achieved (0-100)
  timeSpent: number; // Time spent in seconds
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations (optional)
  user?: {
    id: string;
    name: string;
    email: string;
  };
  quiz?: {
    id: string;
    title: string;
    passingScore: number;
  };
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

// Create/Update DTOs
export interface CreateQuizData {
  title: string;
  description?: string;
  courseId: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  order?: number;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  order?: number;
  isActive?: boolean;
}

export interface CreateQuestionData {
  title: string;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  quizId: string;
  order?: number;
}

export interface UpdateQuestionData {
  title?: string;
  type?: QuestionType;
  content?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
  order?: number;
}

export interface CreateQuizAttemptData {
  userId: string;
  quizId: string;
  answers: QuizAnswers;
  timeSpent: number;
  completed?: boolean;
}

export interface UpdateQuizAttemptData {
  answers?: QuizAnswers;
  timeSpent?: number;
  completed?: boolean;
}

// Quiz answers structure
export interface QuizAnswers {
  [questionId: string]: {
    answer: string | string[]; // Single answer for radio/text, multiple for checkboxes
    timeSpent?: number; // Time spent on this question
  };
}

// Quiz statistics
export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  passRate: number; // Percentage of attempts that passed
  averageTimeSpent: number; // Average time in seconds
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: string;
  title: string;
  correctRate: number; // Percentage of correct answers
  averageTimeSpent: number;
  commonIncorrectAnswers: Array<{
    answer: string;
    count: number;
  }>;
}

// Filter interfaces
export interface QuizFilter {
  courseId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'createdAt' | 'order';
  sortOrder?: 'asc' | 'desc';
}

export interface QuizAttemptFilter {
  userId?: string;
  quizId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// Quiz taking interface
export interface QuizSession {
  quiz: Quiz;
  questions: Question[];
  startTime: Date;
  timeLimit?: number; // in minutes
  currentQuestionIndex: number;
  answers: QuizAnswers;
  isCompleted: boolean;
  score?: number;
}

// Quiz configuration
export interface QuizConfig {
  allowReview: boolean; // Allow students to review answers after submission
  showCorrectAnswers: boolean; // Show correct answers after submission
  showExplanations: boolean; // Show explanations after submission
  randomizeQuestions: boolean; // Randomize question order
  randomizeOptions: boolean; // Randomize option order for multiple choice
  preventBrowserBack: boolean; // Prevent using browser back button
  lockAfterStart: boolean; // Lock quiz after starting (prevent leaving and returning)
}