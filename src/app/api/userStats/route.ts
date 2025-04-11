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

    const stats = await getUserStats(userId);
    
    return NextResponse.json({ 
      success: true, 
      stats 
    });
  } catch (error) {
    console.error('Error in userStats API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user statistics' 
    }, { status: 500 });
  }
} 