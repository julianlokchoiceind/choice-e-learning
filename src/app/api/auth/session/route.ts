import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';

/**
 * GET endpoint to retrieve the current user's session information
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current user's session
    const session = await getServerSession(authOptions);
    
    // If no session exists, return null
    if (!session) {
      return NextResponse.json({ 
        authenticated: false,
        user: null 
      });
    }
    
    // Return the session data
    return NextResponse.json({ 
      authenticated: true,
      user: session.user 
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { 
        authenticated: false,
        error: 'Failed to fetch session' 
      },
      { status: 500 }
    );
  }
} 