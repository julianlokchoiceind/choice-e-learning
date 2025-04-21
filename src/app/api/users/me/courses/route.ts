import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticateUser } from '@/lib/auth/auth-middleware';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateUser(req);
    if (!auth.success) {
      return auth.response;
    }

    // Get user ID from session
    const userId = auth.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 401 }
      );
    }

    // Get user and enrolled courses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { enrolledIds: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If user has no enrolled courses, return empty array
    if (!user.enrolledIds || user.enrolledIds.length === 0) {
      return NextResponse.json({ 
        success: true, 
        courses: [],
        count: 0
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get total count of enrolled courses
    const totalCount = user.enrolledIds?.length || 0;
    
    // Get paginated courses with instructor details using Prisma
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: user.enrolledIds
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        level: true,
        topics: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: skip,
      take: limit
    });
    
    // Get instructor details for each course
    const coursesWithInstructors = await Promise.all(
      courses.map(async (course) => {
        const instructor = course.creatorId
          ? await prisma.user.findUnique({
              where: { id: course.creatorId },
              select: {
                id: true,
                name: true
              }
            })
          : { id: '', name: 'Administrator' };
          
        return {
          ...course,
          instructor: {
            id: instructor.id,
            name: instructor.name
          }
        };
      })
    );

    // Return the enrolled courses
    return NextResponse.json({
      success: true,
      courses: coursesWithInstructors,
      count: totalCount,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + coursesWithInstructors.length < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
} 