"use server";

import prisma from '@/lib/db';
import { UserAchievement, AchievementType } from '@/types';

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId }
    });
    
    return achievements.map(achievement => ({
      id: achievement.id,
      userId: achievement.userId,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      earnedAt: achievement.earnedAt,
      type: achievement.type as AchievementType,
    }));
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

/**
 * Create a new achievement for a user
 */
export async function createAchievement(
  userId: string,
  type: AchievementType,
  title: string,
  description: string,
  icon: string
): Promise<UserAchievement | null> {
  try {
    // Check if user already has this achievement
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        userId,
        type
      }
    });
    
    if (existingAchievement) {
      // User already has this achievement, return it
      return {
        id: existingAchievement.id,
        userId: existingAchievement.userId,
        title: existingAchievement.title,
        description: existingAchievement.description,
        icon: existingAchievement.icon,
        earnedAt: existingAchievement.earnedAt,
        type: existingAchievement.type as AchievementType,
      };
    }
    
    // Create new achievement
    const now = new Date();
    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type,
        title,
        description,
        icon,
        earnedAt: now
      }
    });
    
    return {
      id: achievement.id,
      userId,
      title,
      description,
      icon,
      earnedAt: now,
      type,
    };
  } catch (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
}

/**
 * Check and award achievements for a user
 */
export async function checkAndAwardAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        enrolledIn: true
      }
    });
    
    if (!user) {
      return [];
    }
    
    const newAchievements: UserAchievement[] = [];
    
    // First login achievement
    const firstLoginAchievement = await createAchievement(
      userId,
      AchievementType.FIRST_LOGIN,
      'First Login',
      'You logged into the platform for the first time.',
      'login'
    );
    
    if (firstLoginAchievement) {
      newAchievements.push(firstLoginAchievement);
    }
    
    // Check for course started achievement
    if (user.enrolledIn && user.enrolledIn.length > 0) {
      const courseStartedAchievement = await createAchievement(
        userId,
        AchievementType.COURSE_STARTED,
        'Course Starter',
        'You enrolled in your first course.',
        'course'
      );
      
      if (courseStartedAchievement) {
        newAchievements.push(courseStartedAchievement);
      }
    }
    
    // Check for course completion achievement
    const userProgress = await prisma.userProgress.findMany({
      where: { userId }
    });
    
    if (userProgress.length > 0) {
      // Get all courses enrolled in
      const enrolledCourseIds = user.enrolledIds || [];
      
      // Get all lessons for these courses
      const lessons = await prisma.lesson.findMany({
        where: {
          courseId: {
            in: enrolledCourseIds
          }
        }
      });
      
      // Group lessons by courseId
      const courseLessons: Record<string, number> = {};
      for (const lesson of lessons) {
        if (!courseLessons[lesson.courseId]) {
          courseLessons[lesson.courseId] = 0;
        }
        courseLessons[lesson.courseId]++;
      }
      
      // Count completed lessons per course
      const courseProgress: Record<string, number> = {};
      for (const progress of userProgress) {
        if (progress.completed) {
          if (!courseProgress[progress.courseId]) {
            courseProgress[progress.courseId] = 0;
          }
          courseProgress[progress.courseId]++;
        }
      }
      
      // Check if any course is completed
      for (const [courseId, completedCount] of Object.entries(courseProgress)) {
        const totalLessons = courseLessons[courseId] || 0;
        
        if (totalLessons > 0 && completedCount >= totalLessons) {
          const courseCompletedAchievement = await createAchievement(
            userId,
            AchievementType.COURSE_COMPLETED,
            'Course Completer',
            'You completed your first course.',
            'certificate'
          );
          
          if (courseCompletedAchievement) {
            newAchievements.push(courseCompletedAchievement);
          }
          
          break; // Only need one course completed for the achievement
        }
      }
      
      // Quick Learner achievement - X lessons in Y days
      const completedLessons = userProgress.filter(p => p.completed);
      const completedLessonCount = completedLessons.length;
      
      if (completedLessonCount >= 10) {
        const completedDates = completedLessons
          .filter(p => p.completedAt)
          .map(p => p.completedAt!)
          .sort((a, b) => a.getTime() - b.getTime());
        
        if (completedDates.length > 0) {
          const firstCompletionDate = completedDates[0];
          const daysSinceFirstCompletion = Math.floor(
            (Date.now() - firstCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceFirstCompletion <= 7) {
            const quickLearnerAchievement = await createAchievement(
              userId,
              AchievementType.QUICK_LEARNER,
              'Quick Learner',
              'You completed 10 lessons within a week.',
              'speed'
            );
            
            if (quickLearnerAchievement) {
              newAchievements.push(quickLearnerAchievement);
            }
          }
        }
      }
    }
    
    // Note: For streak achievement, we'd need to modify the User model to include loginHistory
    // This is currently not in the Prisma schema, so it's omitted from the refactored version
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking and awarding achievements:', error);
    return [];
  }
} 