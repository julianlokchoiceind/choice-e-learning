import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers';
import { LessonStatus } from '@prisma/client';

/**
 * PUT /api/admin/courses/[courseId]/curriculum
 * Update course curriculum (chapters and lessons) only
 * Dedicated endpoint to prevent data leakage with course updates
 */
export const PUT = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  try {

    const courseId = context.params.courseId;
    const body = await req.json();

    // Validate required fields
    if (!body.chapters || !Array.isArray(body.chapters)) {
      return NextResponse.json(
        { success: false, error: 'Chapters array is required' },
        { status: 400 }
      );
    }

    if (!body.lessons || !Array.isArray(body.lessons)) {
      return NextResponse.json(
        { success: false, error: 'Lessons array is required' },
        { status: 400 }
      );
    }

    // Verify course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: { lessons: true },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Update curriculum using transaction
    console.log('=== STARTING CURRICULUM TRANSACTION ===');
    console.log('Request body structure:', {
      chaptersCount: body.chapters?.length || 0,
      lessonsCount: body.lessons?.length || 0,
      courseStatus: existingCourse.status
    });
    
    const updatedCourse = await prisma.$transaction(async (tx) => {
      console.log('=== INSIDE CURRICULUM TRANSACTION ===');
      
      // Step 1: Delete existing chapters and lessons for clean slate
      console.log('Deleting existing curriculum...');
      await tx.lesson.deleteMany({
        where: { courseId }
      });
      await tx.chapter.deleteMany({
        where: { courseId }
      });
      
      // Step 2: Create chapters FIRST
      const chapterIdMap = new Map<string, string>();
      
      for (const chapter of body.chapters) {
        console.log(`Creating chapter: ${chapter.title}`);
        const newChapter = await tx.chapter.create({
          data: {
            title: chapter.title,
            description: chapter.description || '',
            order: chapter.order || 1,
            courseId
          }
        });
        
        // Map temporary ID to real ID (now includes temp IDs from client)
        if (chapter.id) {
          chapterIdMap.set(chapter.id, newChapter.id);
          console.log(`Mapped chapter ID: ${chapter.id} → ${newChapter.id}`);
        }
        console.log(`Created chapter with ID: ${newChapter.id}`);
      }
      
      // Step 3: Create lessons AFTER chapters exist
      for (const lesson of body.lessons) {
        const realChapterId = lesson.chapterId ? chapterIdMap.get(lesson.chapterId) : null;
        
        console.log(`Creating lesson: ${lesson.title}`);
        console.log(`  - Original chapterId: ${lesson.chapterId}`);
        console.log(`  - Mapped to real chapterId: ${realChapterId}`);
        
        const lessonData = {
          title: lesson.title || 'Untitled Lesson',
          content: lesson.content || '',
          videoUrl: lesson.videoUrl || null,
          order: lesson.order || 1,
          courseId,
          chapterId: realChapterId
        };
        
        const newLesson = await tx.lesson.create({
          data: lessonData
        });
        console.log(`Created lesson with ID: ${newLesson.id} in chapter: ${realChapterId}`);
      }
      
      // Step 4: Return updated course with new curriculum
      const course = await tx.course.findUnique({
        where: { id: courseId },
        include: {
          chapters: {
            include: { lessons: true },
            orderBy: { order: 'asc' }
          }
        }
      });
      
      console.log('=== CURRICULUM TRANSACTION COMPLETED ===');
      return course;
    });

    // AFTER transaction completion, sync lesson status if needed
    console.log(`=== POST-TRANSACTION STATUS SYNCHRONIZATION ===`);
    if (existingCourse.status === 'published') {
      console.log(`Updating lesson status to published for course ${courseId}`);
      try {
        const updateResult = await prisma.lesson.updateMany({
          where: { courseId: courseId },
          data: { status: LessonStatus.published }
        });
        console.log(`Updated ${updateResult.count} lessons to published status`);
      } catch (statusError) {
        console.error(`Failed to sync lesson status:`, statusError);
        // Don't throw here, as the main curriculum operation was successful
      }
    } else {
      console.log(`No status sync needed - course is ${existingCourse.status}`);
    }

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Curriculum updated successfully'
    });

  } catch (error) {
    console.error('=== CURRICULUM API ERROR ===');
    console.error('Error updating curriculum:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log the error type
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    // If it's a Prisma error, log specific details
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    console.error('=== END CURRICULUM API ERROR ===');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update curriculum' 
      },
      { status: 500 }
    );
  }
});