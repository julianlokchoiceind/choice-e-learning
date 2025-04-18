import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/services/courses';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    console.log(`Fetching user stats for userId: ${userId}`);
    const stats = await getUserStats(userId).catch(err => {
      console.error('Error from getUserStats:', err);
      throw err;
    });
    
    console.log(`Successfully retrieved stats:`, stats);
    return NextResponse.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Error in userStats API route:', error);
    // Include error details in development mode
    const errorDetails = process.env.NODE_ENV === 'development' ? 
      { details: (error as Error).message, stack: (error as Error).stack } : undefined;
      
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user statistics',
      ...(errorDetails && { debug: errorDetails })
    }, { status: 500 });
  }
} 