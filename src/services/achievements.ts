"use server";

import { getCollection } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { UserAchievement, AchievementType } from '@/types';

/**
 * Get all achievements for a user
 */
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const achievementsCollection = await getCollection('achievements');
    const achievements = await achievementsCollection.find({ userId }).toArray();
    
    return achievements.map(achievement => ({
      id: achievement._id.toString(),
      userId: achievement.userId,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      earnedAt: new Date(achievement.earnedAt),
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
    const achievementsCollection = await getCollection('achievements');
    const existingAchievement = await achievementsCollection.findOne({
      userId,
      type
    });
    
    if (existingAchievement) {
      // User already has this achievement, return it
      return {
        id: existingAchievement._id.toString(),
        userId: existingAchievement.userId,
        title: existingAchievement.title,
        description: existingAchievement.description,
        icon: existingAchievement.icon,
        earnedAt: new Date(existingAchievement.earnedAt),
        type: existingAchievement.type as AchievementType,
      };
    }
    
    // Create new achievement
    const now = new Date();
    const achievement = {
      userId,
      type,
      title,
      description,
      icon,
      earnedAt: now,
      createdAt: now,
    };
    
    const result = await achievementsCollection.insertOne(achievement);
    
    if (result.acknowledged) {
      return {
        id: result.insertedId.toString(),
        userId,
        title,
        description,
        icon,
        earnedAt: now,
        type,
      };
    }
    
    return null;
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
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
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
    if (Array.isArray(user.enrolledIds) && user.enrolledIds.length > 0) {
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
    const userProgressCollection = await getCollection('userProgress');
    const progressEntries = await userProgressCollection.find({ userId }).toArray();
    
    if (progressEntries.length > 0) {
      // Group progress by courseId
      const courseProgress: Record<string, number> = {};
      const courseTotals: Record<string, number> = {};
      
      // Get all courses to check total lessons
      const coursesCollection = await getCollection('courses');
      const lessonsCollection = await getCollection('lessons');
      
      for (const courseId of user.enrolledIds || []) {
        const courseLessons = await lessonsCollection.find({ 
          courseId: courseId.toString() 
        }).toArray();
        
        courseTotals[courseId.toString()] = courseLessons.length;
        courseProgress[courseId.toString()] = 0;
      }
      
      // Count completed lessons per course
      for (const progress of progressEntries) {
        if (progress.completed && courseProgress[progress.courseId] !== undefined) {
          courseProgress[progress.courseId]++;
        }
      }
      
      // Check if any course is completed
      for (const [courseId, completed] of Object.entries(courseProgress)) {
        const total = courseTotals[courseId] || 0;
        
        if (total > 0 && completed >= total) {
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
      const completedLessonCount = progressEntries.filter(p => p.completed).length;
      const firstCompletionDate = progressEntries
        .filter(p => p.completed && p.completedAt)
        .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())[0]?.completedAt;
      
      if (completedLessonCount >= 10 && firstCompletionDate) {
        const daysSinceFirstCompletion = Math.floor(
          (Date.now() - new Date(firstCompletionDate).getTime()) / (1000 * 60 * 60 * 24)
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
    
    // Streak achievement
    if (user.loginHistory && Array.isArray(user.loginHistory) && user.loginHistory.length >= 7) {
      // Check for 7-day streak
      const sortedDates = [...user.loginHistory]
        .map(date => new Date(date).toISOString().slice(0, 10))
        .sort()
        .filter((date, i, arr) => arr.indexOf(date) === i); // unique dates
      
      let maxStreak = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }
      
      maxStreak = Math.max(maxStreak, currentStreak);
      
      if (maxStreak >= 7) {
        const streakAchievement = await createAchievement(
          userId,
          AchievementType.STREAK,
          'Consistent Learner',
          'You maintained a 7-day learning streak.',
          'streak'
        );
        
        if (streakAchievement) {
          newAchievements.push(streakAchievement);
        }
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error('Error checking and awarding achievements:', error);
    return [];
  }
} 