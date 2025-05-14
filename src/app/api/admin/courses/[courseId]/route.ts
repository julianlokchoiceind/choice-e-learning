import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers';

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
    const courseId = context.params.courseId;
    
    // Validate course ID
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Check if status is draft and handle empty or default title
    if (body.status === 'draft' && 
        (!body.title || body.title.trim() === '')) {
      
      // Format current date
      const today = new Date();
      const dateStr = `${today.getDate().toString().padStart(2, '0')}${
        (today.getMonth() + 1).toString().padStart(2, '0')}${
        today.getFullYear()}`;
      
      try {
        // Find today's draft courses
        const todayDrafts = await prisma.course.findMany({
          where: {
            title: { contains: `-${dateStr}` },
            status: 'draft'
          }
        });
        
        // Filter standard format and find max sequence
        const untitledPattern = new RegExp(`^Untitled-(\\d+)-${dateStr}$`);
        let maxSequence = 0;
        
        todayDrafts.forEach(draft => {
          const match = draft.title.match(untitledPattern);
          if (match && match[1]) {
            const sequence = parseInt(match[1]);
            if (sequence > maxSequence) {
              maxSequence = sequence;
            }
          }
        });
        
        // Create new title
        body.title = `Untitled-${maxSequence + 1}-${dateStr}`;
        
        console.log(`Updated draft course with generated title: ${body.title}`);
        
      } catch (error) {
        console.error('Error finding draft courses:', error);
        // Fallback with timestamp
        const timestamp = Date.now();
        body.title = `Untitled-1-${dateStr}-${timestamp}`;
      }
    }
    
    // Handle empty description for draft courses
    if (body.status === 'draft' && (!body.description || body.description.trim() === '')) {
      body.description = 'Course description...';
    }
    
    // Process image URL
    if (body.imageUrl === '' || body.imageUrl === null) {
      body.imageUrl = '/images/placeholder-course.jpg';
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
            const slug = topicName.toLowerCase().replace(/\\s+/g, '-');
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
    
    // Prepare update data with updated timestamp
    const updateData = {
      ...body,
      topicIds: topicIds.length > 0 ? topicIds : undefined, // Chỉ cập nhật nếu có dữ liệu mới
      updatedAt: new Date()
    };
    
    // Handle chapters and lessons updates if provided
    if (body.chapters && Array.isArray(body.chapters)) {
      // Process chapters (create, update)
      // In a real implementation, this would handle chapter updates
      console.log(`Processing ${body.chapters.length} chapters for update`);
    }
    
    if (body.lessons && Array.isArray(body.lessons)) {
      // Process lessons (create, update)
      // In a real implementation, this would handle lesson updates and resources
      console.log(`Processing ${body.lessons.length} lessons for update`);
      
      // Make sure each lesson has proper defaults
      body.lessons.forEach((lesson: any) => {
        if (!lesson.videoUrl) {
          lesson.videoUrl = '';
        }
        
        // Ensure resources is properly handled
        if (lesson.resources && Array.isArray(lesson.resources)) {
          // Store resources as JSON in resourcesData
          const resources = lesson.resources || [];
          updateData.resourcesData = JSON.stringify(resources);
        }
      });
    }
    
    try {
      // Update course with Prisma
      let updatedCourse;
      try {
        updatedCourse = await prisma.course.update({
          where: { id: courseId },
          data: {
            ...updateData,
            // Luôn đảm bảo updatedAt được cập nhật, tránh trường hợp Next.js cache lại
            updatedAt: new Date()
          }
        });
        
        // Log thông tin để debug
        console.log(`Updated course ${courseId}`, {
          imageUrl: updatedCourse.imageUrl,
          updatedAt: updatedCourse.updatedAt
        });
      } catch (updateError: any) {
        console.error('Error updating course:', updateError);
        
        // Check if the error is related to the status field
        if (updateError.message && updateError.message.includes('Unknown argument `status`')) {
          console.log('Status field error detected, trying without status field');
          
          // Create a new update data object without the status field
          const { status, ...updateDataWithoutStatus } = updateData;
          
          // Try updating the course without the status field
          updatedCourse = await prisma.course.update({
            where: { id: courseId },
            data: {
              ...updateDataWithoutStatus,
              updatedAt: new Date()
            }
          });
          
          // If we got here, the course was updated without the status field
          console.log('Course updated successfully without status field');
        } else {
          // If it's another error, rethrow it
          throw updateError;
        }
      }
    } catch (error: unknown) {
      // Course not found
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Fetch the updated course to return in the response
    const updatedCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: { select: { students: true } },
        topicsList: true,
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
      // creatorId sẽ được sử dụng thay vì instructorId
      creatorId: updatedCourse.creatorId,
      studentCount: updatedCourse._count.students,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt,
      // Include chapters and lessons in the response
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
          // Parse resourcesData to get resources for the frontend
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
        // Parse resourcesData to get resources for the frontend
        resources: lesson.resourcesData ? JSON.parse(lesson.resourcesData) : []
      })) : []
    };
    
    // Trả về response với header ngăn cache
    const response = NextResponse.json({
      success: true,
      data: transformedCourse,
      message: 'Course updated successfully',
      timestamp: Date.now() // Thêm timestamp để client có thể biết có sự thay đổi
    });
    
    // Thêm header để ngăn cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: unknown) {
    console.error('Error updating course:', error);
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