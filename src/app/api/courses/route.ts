import { NextResponse } from 'next/server';
import { getAllCourses } from '@/services/courses';

export async function GET() {
  try {
    const courses = await getAllCourses();
    
    return NextResponse.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error in /api/courses route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch courses' 
      },
      { status: 500 }
    );
  }
} 