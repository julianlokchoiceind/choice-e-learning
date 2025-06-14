import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { bulkDeleteCourses } from '@/server/services/courses/course-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseIds } = await request.json();

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid course IDs' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteCourses(courseIds);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        failed: result.failed
      }
    });
  } catch (error: unknown) {
    console.error('Error during bulk delete courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete courses' },
      { status: 500 }
    );
  }
}