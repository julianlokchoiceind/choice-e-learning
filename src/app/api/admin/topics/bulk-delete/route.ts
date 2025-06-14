import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { bulkDeleteTopics } from '@/server/services/topics/topic-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { topicIds } = await request.json();

    if (!Array.isArray(topicIds) || topicIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid topic IDs' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteTopics(topicIds);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        failed: result.failed
      }
    });
  } catch (error: unknown) {
    console.error('Error during bulk delete topics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete topics' },
      { status: 500 }
    );
  }
}