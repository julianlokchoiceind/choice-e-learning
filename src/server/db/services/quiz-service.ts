'use server';

import prisma from '@/server/db/prisma-client';
import { Quiz as PrismaQuiz, Question as PrismaQuestion, QuizAttempt as PrismaQuizAttempt } from '@prisma/client';

/**
 * Find all quizzes with optional course filter
 * @param courseId Optional course ID to filter by
 * @returns Array of quizzes
 */
export async function findQuizzes(courseId?: string): Promise<PrismaQuiz[]> {
  try {
    return await prisma.quiz.findMany({
      where: courseId ? { courseId } : {},
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      },
      orderBy: { order: 'asc' }
    });
  } catch (error: unknown) {
    console.error('Error finding quizzes:', error);
    return [];
  }
}

/**
 * Find a quiz by ID
 * @param id Quiz ID
 * @param includeQuestions Include questions in the result
 * @returns Quiz object or null if not found
 */
export async function findQuizById(
  id: string, 
  includeQuestions = false
): Promise<PrismaQuiz | null> {
  try {
    if (!id) {
      return null;
    }
    
    return await prisma.quiz.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        questions: includeQuestions ? {
          orderBy: { order: 'asc' }
        } : false,
        _count: {
          select: {
            questions: true,
            attempts: true
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error finding quiz by ID:', error);
    return null;
  }
}

/**
 * Create a new quiz
 * @param data Quiz creation data
 * @returns Created quiz or null if creation failed
 */
export async function createQuiz(data: {
  title: string;
  description?: string;
  courseId: string;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  order?: number;
}): Promise<PrismaQuiz | null> {
  try {
    // Get the next order number
    const maxOrder = await prisma.quiz.aggregate({
      where: { courseId: data.courseId },
      _max: { order: true }
    });
    
    const nextOrder = (maxOrder._max.order || 0) + 1;
    const orderValue = data.order || nextOrder;
    
    return await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        courseId: data.courseId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || 70,
        maxAttempts: data.maxAttempts || 3,
        order: orderValue
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error creating quiz:', error);
    return null;
  }
}

/**
 * Update quiz
 * @param quizId Quiz ID
 * @param data Update data
 * @returns Updated quiz or null if update failed
 */
export async function updateQuiz(
  quizId: string,
  data: Partial<{
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    maxAttempts: number;
    order: number;
    isActive: boolean;
  }>
): Promise<PrismaQuiz | null> {
  try {
    return await prisma.quiz.update({
      where: { id: quizId },
      data,
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error updating quiz:', error);
    return null;
  }
}

/**
 * Delete quiz
 * @param quizId Quiz ID
 * @returns Deleted quiz or null if deletion failed
 */
export async function deleteQuiz(quizId: string): Promise<PrismaQuiz | null> {
  try {
    return await prisma.quiz.delete({
      where: { id: quizId }
    });
  } catch (error: unknown) {
    console.error('Error deleting quiz:', error);
    return null;
  }
}

/**
 * Find quiz questions
 * @param quizId Quiz ID
 * @returns Array of questions
 */
export async function findQuizQuestions(quizId: string): Promise<PrismaQuestion[]> {
  try {
    return await prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' }
    });
  } catch (error: unknown) {
    console.error('Error finding quiz questions:', error);
    return [];
  }
}

/**
 * Create a new question
 * @param data Question creation data
 * @returns Created question or null if creation failed
 */
export async function createQuestion(data: {
  title: string;
  type: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points?: number;
  quizId: string;
  order?: number;
}): Promise<PrismaQuestion | null> {
  try {
    // Get the next order number
    const maxOrder = await prisma.question.aggregate({
      where: { quizId: data.quizId },
      _max: { order: true }
    });
    
    const nextOrder = (maxOrder._max.order || 0) + 1;
    const orderValue = data.order || nextOrder;
    
    return await prisma.question.create({
      data: {
        title: data.title,
        type: data.type,
        content: data.content,
        options: data.options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points || 1,
        quizId: data.quizId,
        order: orderValue
      }
    });
  } catch (error: unknown) {
    console.error('Error creating question:', error);
    return null;
  }
}

/**
 * Update question
 * @param questionId Question ID
 * @param data Update data
 * @returns Updated question or null if update failed
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<{
    title: string;
    type: string;
    content: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    points: number;
    order: number;
  }>
): Promise<PrismaQuestion | null> {
  try {
    return await prisma.question.update({
      where: { id: questionId },
      data
    });
  } catch (error: unknown) {
    console.error('Error updating question:', error);
    return null;
  }
}

/**
 * Delete question
 * @param questionId Question ID
 * @returns Deleted question or null if deletion failed
 */
export async function deleteQuestion(questionId: string): Promise<PrismaQuestion | null> {
  try {
    return await prisma.question.delete({
      where: { id: questionId }
    });
  } catch (error: unknown) {
    console.error('Error deleting question:', error);
    return null;
  }
}

/**
 * Find quiz attempts by user
 * @param userId User ID
 * @param quizId Optional quiz ID to filter by
 * @returns Array of quiz attempts
 */
export async function findQuizAttempts(
  userId: string,
  quizId?: string
): Promise<PrismaQuizAttempt[]> {
  try {
    return await prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(quizId && { quizId })
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error: unknown) {
    console.error('Error finding quiz attempts:', error);
    return [];
  }
}

/**
 * Create a quiz attempt
 * @param data Quiz attempt data
 * @returns Created quiz attempt or null if creation failed
 */
export async function createQuizAttempt(data: {
  userId: string;
  quizId: string;
  answers: string;
  score: number;
  timeSpent: number;
  completed?: boolean;
}): Promise<PrismaQuizAttempt | null> {
  try {
    return await prisma.quizAttempt.create({
      data: {
        userId: data.userId,
        quizId: data.quizId,
        answers: data.answers,
        score: data.score,
        timeSpent: data.timeSpent,
        completed: data.completed || false,
        completedAt: data.completed ? new Date() : null
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true
          }
        }
      }
    });
  } catch (error: unknown) {
    console.error('Error creating quiz attempt:', error);
    return null;
  }
}

/**
 * Update quiz attempt
 * @param attemptId Attempt ID
 * @param data Update data
 * @returns Updated quiz attempt or null if update failed
 */
export async function updateQuizAttempt(
  attemptId: string,
  data: Partial<{
    answers: string;
    score: number;
    timeSpent: number;
    completed: boolean;
  }>
): Promise<PrismaQuizAttempt | null> {
  try {
    return await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        ...data,
        completedAt: data.completed ? new Date() : undefined
      }
    });
  } catch (error: unknown) {
    console.error('Error updating quiz attempt:', error);
    return null;
  }
}