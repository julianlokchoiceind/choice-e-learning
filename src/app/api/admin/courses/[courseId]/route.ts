import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers';
import { updateCourse } from '@/server/db/services/course-service';

// Type for route params
type RouteParams = {
  params: {
    courseId: string;
  };
};

// GET a specific course by ID (admin view)
export const GET = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  try {
    const courseId = context.params.courseId;
    
    // Validate course ID
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Find course by ID using Prisma
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { 
            students: true 
          }
        },
        topicsList: true, // Include topic information from relationship
        chapters: {
          orderBy: {
            order: 'asc'
          },
          include: {
            lessons: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        lessons: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Transform for response
    const transformedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      level: course.level,
      status: course.status,
      topics: course.topics,
      topicsList: Array.isArray(course.topicsList) 
        ? course.topicsList.map(topic => ({
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            isActive: topic.isActive
          }))
        : [],
      imageUrl: course.imageUrl,
      creatorId: course.creatorId,
      studentCount: course._count.students,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      // Add chapters and lessons
      chapters: course.chapters ? course.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description || '',
        order: chapter.order,
        courseId: chapter.courseId,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        lessons: chapter.lessons ? chapter.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          order: lesson.order,
          chapterId: lesson.chapterId,
          courseId: lesson.courseId,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
          // Parse resourcesData to get resources for the frontend
          resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
        })) : []
      })) : [],
      lessons: course.lessons ? course.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order,
        chapterId: lesson.chapterId,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        // Parse resourcesData to get resources for the frontend
        resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
      })) : []
    };
    
    return NextResponse.json({
      success: true,
      data: transformedCourse
    });
  } catch (error: unknown) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
});

// PUT - Update a course
export const PUT = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  try {
    
    // Check if params exists
    if (!context.params) {
      console.error('context.params is undefined');
      return NextResponse.json(
        { success: false, error: 'Invalid request context - params missing' },
        { status: 500 }
      );
    }
    
    
    // Try to get courseId from params
    let courseId = context.params?.courseId;
    
    // If courseId is still not found, try extracting from URL as last resort
    if (!courseId) {
      const url = new URL(req.url);
      const pathSegments = url.pathname.split('/');
      const courseIndex = pathSegments.indexOf('courses');
      if (courseIndex !== -1 && courseIndex + 1 < pathSegments.length) {
        courseId = pathSegments[courseIndex + 1];
      }
    }
    
    // Validate course ID
    if (!courseId) {
      console.error('No courseId found in params or URL');
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    
    // Kiểm tra course tồn tại TRƯỚC khi xử lý bất kỳ logic nào
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!existingCourse) {
      console.error(`Course not found with ID: ${courseId}`);
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    console.log('Update course request body:', JSON.stringify(body, null, 2));
    
    // Handle empty title
    if (!body.title || body.title.trim() === '') {
      body.title = existingCourse.title;
    }
    
    // No auto-fill for description - let user enter their own content
    
    // Process image URL
    if (body.imageUrl === '' || body.imageUrl === null) {
      body.imageUrl = '/images/courses/course-placeholder.jpg';
    }
    
    // Process video URL - make empty string instead of null for consistency
    if (body.videoUrl === null) {
      body.videoUrl = '';
    }
    
    // Từ mảng topics, cập nhật topicIds
    let topicIds: string[] = [];
    if (body.topics && Array.isArray(body.topics)) {
      const topicObjects = await Promise.all(
        body.topics.map(async (topicName: string) => {
          // Tìm topic theo tên
          let topic = await prisma.topic.findFirst({
            where: { name: { equals: topicName, mode: 'insensitive' } }
          });
          
          // Nếu không tìm thấy, tạo mới
          if (!topic) {
            const slug = topicName.toLowerCase().replace(/\s+/g, '-');
            topic = await prisma.topic.create({
              data: {
                name: topicName,
                slug,
                isActive: true
              }
            });
          }
          
          return topic;
        })
      );
      
      topicIds = topicObjects.map(topic => topic.id);
    }
    
    // Prepare update data with explicit field mapping - only allowed course fields
    const updateData: any = {
      title: body.title || existingCourse.title,
      description: body.description !== undefined ? body.description : existingCourse.description,
      price: body.price !== undefined ? body.price : existingCourse.price,
      level: body.level || existingCourse.level,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : existingCourse.imageUrl,
      videoUrl: body.videoUrl !== undefined ? body.videoUrl : existingCourse.videoUrl,
      status: body.status !== undefined ? body.status : existingCourse.status,
      topics: body.topics !== undefined ? body.topics : existingCourse.topics,
      topicIds: topicIds.length > 0 ? topicIds : undefined,
      updatedAt: new Date()
    };
    
    // NOTE: Curriculum updates (chapters/lessons) are now handled by dedicated endpoint:
    // PUT /api/admin/courses/[courseId]/curriculum
    // This prevents data leakage and ensures explicit curriculum saves only
    
    console.log('Prepared update data:', JSON.stringify(updateData, null, 2));
    
    // Use transaction to update course and optionally lessons if status changes
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Update the course
      const course = await tx.course.update({
        where: { id: courseId },
        data: updateData,
        include: {
          _count: { select: { students: true } },
          topicsList: true,
          chapters: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' }
              }
            }
          },
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      });

      // Ensure lessons always match course status (sync on every update)
      // Get final course status from updateData
      const finalCourseStatus = updateData.status || existingCourse.status;
      console.log(`Final course status: ${finalCourseStatus}, syncing lessons...`);
      
      const lessonStatus = finalCourseStatus === 'published' ? 'published' : 'draft';
      
      const lessonUpdateResult = await tx.lesson.updateMany({
        where: { courseId: courseId },
        data: { status: lessonStatus }
      });
      
      console.log(`Updated ${lessonUpdateResult.count} lessons to status: ${lessonStatus}`);

      return course;
    });

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, error: 'Updated course not found' },
        { status: 404 }
      );
    }

    // Transform for response
    const transformedCourse = {
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      price: updatedCourse.price,
      level: updatedCourse.level,
      status: updatedCourse.status,
      topics: updatedCourse.topics,
      topicsList: Array.isArray(updatedCourse.topicsList) 
        ? updatedCourse.topicsList.map(topic => ({
            id: topic.id,
            name: topic.name,
            slug: topic.slug,
            isActive: topic.isActive
          }))
        : [],
      imageUrl: updatedCourse.imageUrl,
      creatorId: updatedCourse.creatorId,
      studentCount: updatedCourse._count.students,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt,
      // Include existing chapters and lessons in response
      chapters: updatedCourse.chapters ? updatedCourse.chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description || '',
        order: chapter.order,
        courseId: chapter.courseId,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
        lessons: chapter.lessons ? chapter.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || '',
          order: lesson.order,
          chapterId: lesson.chapterId,
          courseId: lesson.courseId,
          createdAt: lesson.createdAt,
          updatedAt: lesson.updatedAt,
          resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
        })) : []
      })) : [],
      lessons: updatedCourse.lessons ? updatedCourse.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || '',
        videoUrl: lesson.videoUrl || '',
        order: lesson.order,
        chapterId: lesson.chapterId,
        courseId: lesson.courseId,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
      })) : []
    };
    
    return NextResponse.json({
      success: true,
      data: transformedCourse,
      message: 'Course updated successfully'
    });
  } catch (error: unknown) {
    console.error('Error updating course:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
});

// DELETE - Delete a course
export const DELETE = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  try {
    const courseId = context.params.courseId;
    
    // Validate course ID
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    try {
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      
      if (!course) {
        return NextResponse.json(
          { success: false, error: 'Course not found' },
          { status: 404 }
        );
      }
      
      // Delete the course and cascade delete associated lessons (if cascade is set up)
      await prisma.course.delete({
        where: { id: courseId }
      });
    
      return NextResponse.json({
        success: true,
        data: { success: true },
        message: 'Course and associated lessons deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete course' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in course deletion route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}); 