import prisma from '@/server/db/prisma-client';

/**
 * Update user's login streak information
 * @param userId User ID to update
 * @returns Success flag
 */
export async function updateLoginStreak(userId: string): Promise<boolean> {
  try {
    const now = new Date();
    
    // Get user data from Prisma using any type casting
    const userData = await prisma.user.findUnique({
      where: { id: userId }
    }) as any;
    
    if (!userData) {
      console.error('User not found when updating login streak');
      return false;
    }
    
    // Calculate if this is a streak continuation
    let newLoginStreak = userData.loginStreak || 0;
    
    if (userData.lastLoginAt) {
      // Get last login date (without time)
      const lastLoginDate = new Date(userData.lastLoginAt);
      lastLoginDate.setHours(0, 0, 0, 0);
      
      // Get current date (without time)
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // Get yesterday's date (without time)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if last login was yesterday (streak continues)
      if (lastLoginDate.getTime() === yesterday.getTime()) {
        newLoginStreak++;
      } 
      // If last login was today, maintain streak but don't increment
      else if (lastLoginDate.getTime() === today.getTime()) {
        // Do nothing, keep same streak
      } 
      // If last login was before yesterday, reset streak
      else {
        newLoginStreak = 1; // Reset streak but count today
      }
    } else {
      // First login ever
      newLoginStreak = 1;
    }
    
    // Update user using prisma with type casting
    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        lastLoginAt: now,
        loginStreak: newLoginStreak,
        updatedAt: now
      }
    });
    
    return true;
  } catch (error: unknown) {
    console.error('Error updating login streak:', error);
    return false;
  }
}

/**
 * Get user's current login streak
 * @param userId User ID
 * @returns Current login streak or 0 if not found
 */
export async function getUserLoginStreak(userId: string): Promise<number> {
  try {
    // Get user data from Prisma using any type casting
    const userData = await prisma.user.findUnique({
      where: { id: userId }
    }) as any;
    
    return userData?.loginStreak || 0;
  } catch (error: unknown) {
    console.error('Error getting user login streak:', error);
    return 0;
  }
} 