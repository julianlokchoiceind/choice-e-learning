import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { bulkDeleteLessons } from '@/server/services/lessons/lesson-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { lessonIds } = await request.json();

    if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid lesson IDs' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteLessons(lessonIds);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        failed: result.failed
      }
    });
  } catch (error: unknown) {
    console.error('Error during bulk delete lessons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete lessons' },
      { status: 500 }
    );
  }
}