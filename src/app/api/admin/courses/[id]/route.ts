import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { withAdmin } from '@/lib/api/route-handlers';

// GET a specific course by ID (admin view)
export const GET = withAdmin(async (req: NextRequest, context: any) => {
  try {
    const courseId = req.nextUrl.pathname.split('/').pop();
    
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
        topicsList: true // Bao gồm thông tin topics từ relationship
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
      updatedAt: course.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      data: transformedCourse
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
});

// PUT - Update a course
export const PUT = withAdmin(async (req: NextRequest, context: any) => {
  try {
    const courseId = req.nextUrl.pathname.split('/').pop();
    
    // Validate course ID
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
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
    
    try {
      // Update course with Prisma
      const updatedCourse = await prisma.course.update({
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
      
    } catch (error) {
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
        topicsList: true
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
      updatedAt: updatedCourse.updatedAt
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
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
});

// DELETE - Delete a course
export const DELETE = withAdmin(async (req: NextRequest, context: any) => {
  try {
    const courseId = req.nextUrl.pathname.split('/').pop();
    
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
    } catch (error) {
      console.error('Error deleting course:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete course' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in course deletion route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
});
