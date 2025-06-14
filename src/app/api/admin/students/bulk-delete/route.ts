import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { bulkDeleteStudents } from '@/server/services/students/student-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentIds } = await request.json();

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid student IDs' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteStudents(studentIds);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        failed: result.failed
      }
    });
  } catch (error: unknown) {
    console.error('Error during bulk delete students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete students' },
      { status: 500 }
    );
  }
}