import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { ReferenceLinkService } from '@/server/services/courses/reference-link-service';
import { createReferenceLinkSchema, referenceLinkFilterSchema } from '@/shared/schemas/courses/reference-link-schema';
import { validateRequest } from '@/server/utils/data/validation';

/**
 * GET /api/admin/courses/[courseId]/reference-links
 * Get all reference links for a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { courseId } = params;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filter = {
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate filter parameters
    const validationResult = referenceLinkFilterSchema.safeParse(filter);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid filter parameters',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Get reference links
    const referenceLinks = await ReferenceLinkService.getReferenceLinks(courseId, validationResult.data);
    const total = await ReferenceLinkService.getReferenceLinkCount(courseId, validationResult.data);

    return NextResponse.json({
      success: true,
      data: {
        referenceLinks,
        total
      }
    });

  } catch (error: any) {
    console.error('Error fetching reference links:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reference links',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/courses/[courseId]/reference-links
 * Create a new reference link
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { courseId } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = validateRequest(createReferenceLinkSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.errors 
        },
        { status: 400 }
      );
    }

    // Auto-normalize URL (add https:// if missing)
    const data = validationResult.data!;
    const { url: originalUrl, title, description, order } = data;
    let url = originalUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Create reference link
    const referenceLink = await ReferenceLinkService.createReferenceLink(courseId, {
      title,
      url,
      description,
      order
    });

    return NextResponse.json({
      success: true,
      data: referenceLink,
      message: 'Reference link created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating reference link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create reference link',
        details: error.message 
      },
      { status: 500 }
    );
  }
}