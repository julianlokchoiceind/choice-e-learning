import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { CourseReferenceLinkService } from '@/server/services/courses/course-reference-link-service';
import { updateCourseReferenceLinkSchema } from '@/shared/schemas/courses/course-reference-link-schema';
import { validateRequest } from '@/server/utils/data/validation';

/**
 * GET /api/admin/courses/[courseId]/course-reference-links/[linkId]
 * Get a single reference link by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; linkId: string } }
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

    const { linkId } = params;

    // Get reference link
    const courseReferenceLink = await CourseReferenceLinkService.getCourseReferenceLinkById(linkId);
    
    if (!courseReferenceLink) {
      return NextResponse.json(
        { success: false, error: 'Reference link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: courseReferenceLink
    });

  } catch (error: any) {
    console.error('Error fetching reference link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch reference link',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/courses/[courseId]/course-reference-links/[linkId]
 * Update a reference link
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string; linkId: string } }
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

    const { linkId } = params;
    const body = await request.json();

    // Validate request body
    const validationResult = validateRequest(updateCourseReferenceLinkSchema, body);
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

    // Auto-normalize URL if provided (add https:// if missing)
    const updateData = { ...validationResult.data! };
    if (updateData.url && !updateData.url.startsWith('http://') && !updateData.url.startsWith('https://')) {
      updateData.url = 'https://' + updateData.url;
    }

    // Check if reference link exists
    const existingLink = await CourseReferenceLinkService.getCourseReferenceLinkById(linkId);
    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Reference link not found' },
        { status: 404 }
      );
    }

    // Update reference link
    const courseReferenceLink = await CourseReferenceLinkService.updateCourseReferenceLink(linkId, updateData);

    return NextResponse.json({
      success: true,
      data: courseReferenceLink,
      message: 'Reference link updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating reference link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update reference link',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/courses/[courseId]/course-reference-links/[linkId]
 * Delete a reference link
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string; linkId: string } }
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

    const { linkId } = params;

    // Check if reference link exists
    const existingLink = await CourseReferenceLinkService.getCourseReferenceLinkById(linkId);
    if (!existingLink) {
      return NextResponse.json(
        { success: false, error: 'Reference link not found' },
        { status: 404 }
      );
    }

    // Delete reference link
    await CourseReferenceLinkService.deleteCourseReferenceLink(linkId);

    return NextResponse.json({
      success: true,
      message: 'Reference link deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting reference link:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete reference link',
        details: error.message 
      },
      { status: 500 }
    );
  }
}