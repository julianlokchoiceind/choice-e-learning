import { NextRequest, NextResponse } from 'next/server';
import { getUserAchievements, checkAndAwardAchievements } from '@/services/achievements';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    // Get the currently authenticated user
    const session = await getServerSession(authOptions).catch(error => {
      console.error('Error getting server session:', error);
      return null;
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    console.log(`Processing achievements for user ${userId}`);
    
    try {
      // Check and award any pending achievements
      console.log('Checking and awarding achievements...');
      await checkAndAwardAchievements(userId).catch(error => {
        console.error('Error checking and awarding achievements:', error);
        // Continue with getting existing achievements even if awarding fails
      });
    } catch (awardError) {
      console.error('Error in award achievements step:', awardError);
      // Continue with getting existing achievements
    }
    
    // Get all achievements for the user
    console.log('Getting user achievements...');
    const achievements = await getUserAchievements(userId).catch(error => {
      console.error('Error getting user achievements:', error);
      throw error;
    });
    
    if (!achievements || !Array.isArray(achievements)) {
      console.warn('No achievements returned or invalid format');
      return NextResponse.json({ 
        success: true, 
        achievements: [] 
      });
    }
    
    // Sort achievements by date earned (newest first)
    achievements.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
    console.log(`Found ${achievements.length} achievements for user`);
    
    return NextResponse.json({ 
      success: true, 
      achievements 
    });
  } catch (error) {
    console.error('Error in achievements API route:', error);
    // Include error details in development
    const errorDetails = process.env.NODE_ENV === 'development' ? 
      { details: (error as Error).message, stack: (error as Error).stack } : undefined;
      
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch achievements',
      ...(errorDetails && { debug: errorDetails })
    }, { status: 500 });
  }
} 