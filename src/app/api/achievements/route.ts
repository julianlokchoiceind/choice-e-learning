import { NextRequest, NextResponse } from 'next/server';
import { getUserAchievements, checkAndAwardAchievements } from '@/services/achievements';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

export async function GET(request: NextRequest) {
  try {
    // Get the currently authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check and award any pending achievements
    await checkAndAwardAchievements(userId);
    
    // Get all achievements for the user
    const achievements = await getUserAchievements(userId);
    
    // Sort achievements by date earned (newest first)
    achievements.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
    
    return NextResponse.json({ 
      success: true, 
      achievements 
    });
  } catch (error) {
    console.error('Error in achievements API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch achievements' 
    }, { status: 500 });
  }
} 