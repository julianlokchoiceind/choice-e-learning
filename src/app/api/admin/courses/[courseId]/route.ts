import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers';

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
    console.log('=== PUT COURSE UPDATE DEBUG ===');
    console.log('Full context object:', JSON.stringify(context, null, 2));
    console.log('Context keys:', Object.keys(context));
    console.log('Params object:', context.params);
    console.log('Params type:', typeof context.params);
    
    // Check if params exists
    if (!context.params) {
      console.error('context.params is undefined');
      return NextResponse.json(
        { success: false, error: 'Invalid request context - params missing' },
        { status: 500 }
      );
    }
    
    console.log('Raw courseId from params:', context.params?.courseId);
    
    // Try to get courseId from params or fallback to URL parsing
    let courseId = context.params?.courseId;
    
    // Fallback: Extract courseId from URL if params is not available
    if (!courseId && req.url) {
      const urlParts = req.url.split('/');
      const courseIdIndex = urlParts.findIndex(part => part === 'courses') + 1;
      if (courseIdIndex > 0 && courseIdIndex < urlParts.length) {
        courseId = urlParts[courseIdIndex];
        console.log('Extracted courseId from URL:', courseId);
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
    
    console.log('Course ID to update:', courseId);
    
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
    
    // Handle empty title
    if (!body.title || body.title.trim() === '') {
      body.title = existingCourse.title;
    }
    
    // Handle empty description for draft courses
    if (body.status === 'draft' && (!body.description || body.description.trim() === '')) {
      body.description = 'Course description...';
    }
    
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
    if ((body.chapters && Array.isArray(body.chapters)) || (body.lessons && Array.isArray(body.lessons))) {
      // Use transaction to ensure data consistency
      await prisma.$transaction(async (tx) => {
        // Handle chapters first
        if (body.chapters && Array.isArray(body.chapters)) {
          console.log(`Processing ${body.chapters.length} chapters for update`);
          
          // Get existing chapters
          const existingChapters = await tx.chapter.findMany({
            where: { courseId },
            include: { lessons: true }
          });
          
          const existingChapterIds = existingChapters.map(c => c.id);
          const incomingChapterIds = body.chapters.filter((c: any) => c.id).map((c: any) => c.id);
          
          // Delete chapters that are no longer in the incoming data
          const chaptersToDelete = existingChapterIds.filter(id => !incomingChapterIds.includes(id));
          if (chaptersToDelete.length > 0) {
            await tx.chapter.deleteMany({
              where: { id: { in: chaptersToDelete } }
            });
          }
          
          // Process each chapter (create or update)
          for (const chapter of body.chapters) {
            const chapterData = {
              title: chapter.title || 'Untitled Chapter',
              description: chapter.description || '',
              order: chapter.order || 1,
              courseId
            };
            
            if (chapter.id && existingChapterIds.includes(chapter.id)) {
              // Update existing chapter
              await tx.chapter.update({
                where: { id: chapter.id },
                data: chapterData
              });
            } else {
              // Create new chapter
              await tx.chapter.create({
                data: {
                  ...chapterData,
                  id: chapter.id || undefined // Use provided ID if available
                }
              });
            }
          }
        }
        
        // Handle lessons after chapters
        if (body.lessons && Array.isArray(body.lessons)) {
          console.log(`Processing ${body.lessons.length} lessons for update`);
          
          // Get existing lessons
          const existingLessons = await tx.lesson.findMany({
            where: { courseId }
          });
          
          const existingLessonIds = existingLessons.map(l => l.id);
          const incomingLessonIds = body.lessons.filter((l: any) => l.id).map((l: any) => l.id);
          
          // Delete lessons that are no longer in the incoming data
          const lessonsToDelete = existingLessonIds.filter(id => !incomingLessonIds.includes(id));
          if (lessonsToDelete.length > 0) {
            await tx.lesson.deleteMany({
              where: { id: { in: lessonsToDelete } }
            });
          }
          
          // Process each lesson (create or update)
          for (const lesson of body.lessons) {
            const lessonData = {
              title: lesson.title || 'Untitled Lesson',
              content: lesson.content || '',
              videoUrl: lesson.videoUrl || '',
              order: lesson.order || 1,
              courseId,
              chapterId: lesson.chapterId || null,
              resourcesData: lesson.resources ? JSON.stringify(lesson.resources) : null
            };
            
            if (lesson.id && existingLessonIds.includes(lesson.id)) {
              // Update existing lesson
              await tx.lesson.update({
                where: { id: lesson.id },
                data: lessonData
              });
            } else {
              // Create new lesson
              await tx.lesson.create({
                data: {
                  ...lessonData,
                  id: lesson.id || undefined // Use provided ID if available
                }
              });
            }
          }
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