import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { bulkDeleteFAQs } from '@/server/services/faq/faq-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { faqIds } = await request.json();

    if (!Array.isArray(faqIds) || faqIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid FAQ IDs' },
        { status: 400 }
      );
    }

    const result = await bulkDeleteFAQs(faqIds);

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.deleted,
        failed: result.failed
      }
    });
  } catch (error: unknown) {
    console.error('Error during bulk delete FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQs' },
      { status: 500 }
    );
  }
}