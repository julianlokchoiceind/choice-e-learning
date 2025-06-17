/**
 * Quiz Attempt API endpoint
 * Handles quiz attempt creation and submission (student)
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
  apiSuccess, 
  apiServerError,
  apiError,
  apiNotFound
} from '@/server/api/api-response';
import { ApiErrorCode } from '@/server/api/api-errors';
import { 
  withErrorHandling, 
  withAuth,
  AuthenticatedContext
} from '@/server/api/route-handlers';
import { 
  findQuizById,
  createQuizAttempt,
  findQuizAttempts
} from '@/server/db/services/quiz-service';

// POST handler to create/submit a quiz attempt (authenticated users)
export const POST = withAuth(async (
  req: NextRequest, 
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  const userId = context.user.id;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    const body = await req.json();
    
    // Validate attempt data with Zod
    const attemptSchema = z.object({
      answers: z.record(z.object({
        answer: z.union([z.string(), z.array(z.string())]),
        timeSpent: z.number().optional()
      })),
      timeSpent: z.number().min(0),
      completed: z.boolean().default(true)
    });
    
    const validation = attemptSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Quiz attempt validation failed:', validation.error.format());
      return apiError(
        'Invalid attempt data',
        validation.error.format(),
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Check if quiz exists and is active
    const quiz = await findQuizById(quizId, true); // Include questions
    if (!quiz) {
      return apiNotFound('Quiz');
    }
    
    if (!quiz.isActive) {
      return apiError('Quiz is not active', {}, ApiErrorCode.VALIDATION_ERROR);
    }
    
    // Check if user has exceeded max attempts
    const existingAttempts = await findQuizAttempts(userId, quizId);
    if (existingAttempts.length >= quiz.maxAttempts) {
      return apiError(
        `Maximum attempts (${quiz.maxAttempts}) exceeded`,
        { attemptsUsed: existingAttempts.length, maxAttempts: quiz.maxAttempts },
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // Calculate score
    const { answers, timeSpent, completed } = validation.data;
    const quizWithQuestions = quiz as any; // Type assertion since we know questions are included
    const score = calculateQuizScore(quizWithQuestions.questions || [], answers);
    
    // Create the quiz attempt
    const attempt = await createQuizAttempt({
      userId,
      quizId,
      answers: JSON.stringify(answers),
      score,
      timeSpent,
      completed
    });
    
    if (!attempt) {
      return apiServerError('Failed to create quiz attempt');
    }
    
    // Return attempt with additional info
    const result = {
      ...attempt,
      passed: score >= quiz.passingScore,
      passingScore: quiz.passingScore,
      attemptsUsed: existingAttempts.length + 1,
      maxAttempts: quiz.maxAttempts,
      answers: JSON.parse(attempt.answers) // Parse back for response
    };
    
    return apiSuccess(result, 'Quiz attempt submitted successfully');
  } catch (error: unknown) {
    console.error(`Error creating quiz attempt for quiz ${quizId}:`, error);
    return apiServerError('Failed to submit quiz attempt');
  }
});

// GET handler to fetch user's attempts for a quiz (authenticated users)
export const GET = withAuth(async (
  req: NextRequest,
  context: AuthenticatedContext
) => {
  const quizId = context.params.quizId;
  const userId = context.user.id;
  
  if (!quizId) {
    return apiError('Quiz ID is required', {}, ApiErrorCode.VALIDATION_ERROR);
  }
  
  try {
    // Check if quiz exists
    const quiz = await findQuizById(quizId);
    if (!quiz) {
      return apiNotFound('Quiz');
    }
    
    // Get user's attempts for this quiz
    const attempts = await findQuizAttempts(userId, quizId);
    
    // Add additional info to attempts
    const enrichedAttempts = attempts.map(attempt => ({
      ...attempt,
      passed: attempt.score >= quiz.passingScore,
      passingScore: quiz.passingScore,
      answers: JSON.parse(attempt.answers)
    }));
    
    const result = {
      attempts: enrichedAttempts,
      attemptsUsed: attempts.length,
      maxAttempts: quiz.maxAttempts,
      canRetake: attempts.length < quiz.maxAttempts,
      bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
      hasPassedQuiz: attempts.some(a => a.score >= quiz.passingScore)
    };
    
    return apiSuccess(result);
  } catch (error: unknown) {
    console.error(`Error fetching quiz attempts for quiz ${quizId}:`, error);
    return apiServerError('Failed to fetch quiz attempts');
  }
});

/**
 * Calculate quiz score based on correct answers
 */
function calculateQuizScore(
  questions: any[], 
  userAnswers: Record<string, { answer: string | string[]; timeSpent?: number }>
): number {
  if (questions.length === 0) return 0;
  
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;
  
  questions.forEach(question => {
    const userAnswer = userAnswers[question.id];
    const points = question.points || 1;
    totalPoints += points;
    
    if (userAnswer) {
      const isCorrect = checkAnswer(question, userAnswer.answer);
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += points;
      }
    }
  });
  
  // Calculate percentage based on points
  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
}

/**
 * Check if user answer is correct
 */
function checkAnswer(question: any, userAnswer: string | string[]): boolean {
  const correctAnswer = question.correctAnswer;
  
  switch (question.type) {
    case 'multiple_choice':
    case 'true_false':
      return Array.isArray(userAnswer) 
        ? userAnswer.includes(correctAnswer)
        : userAnswer === correctAnswer;
        
    case 'short_answer':
      if (typeof userAnswer !== 'string') return false;
      // Simple text comparison (case-insensitive, trimmed)
      return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
      
    default:
      return false;
  }
}