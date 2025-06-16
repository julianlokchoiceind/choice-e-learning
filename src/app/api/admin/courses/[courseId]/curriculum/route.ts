import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma-client';
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers';

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
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Initialize chapterIdMap for lessons processing
      const chapterIdMap = new Map<string, string>();
      
      // Handle chapters first
      console.log(`Processing ${body.chapters.length} chapters for curriculum update`);
      
      // Get existing chapters
      const existingChapters = await tx.chapter.findMany({
        where: { courseId },
        include: { lessons: true }
      });
      
      const existingChapterIds = existingChapters.map(c => c.id);
      const incomingChapterIds = body.chapters
        .filter((c: any) => c.id && !c.id.startsWith('temp-'))
        .map((c: any) => c.id);
      
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
        
        if (chapter.id && !chapter.id.startsWith('temp-') && existingChapterIds.includes(chapter.id)) {
          // Update existing chapter
          await tx.chapter.update({
            where: { id: chapter.id },
            data: chapterData
          });
          chapterIdMap.set(chapter.id, chapter.id);
        } else {
          // Create new chapter
          const newChapter = await tx.chapter.create({
            data: chapterData
          });
          
          // Map temp ID to real ID for lessons processing
          if (chapter.id && chapter.id.startsWith('temp-')) {
            chapterIdMap.set(chapter.id, newChapter.id);
          }
        }
      }

      // Handle lessons if provided
      if (body.lessons && Array.isArray(body.lessons) && body.lessons.length > 0) {
        console.log(`Processing ${body.lessons.length} lessons for curriculum update`);
        
        // Get existing lessons
        const existingLessons = await tx.lesson.findMany({
          where: { courseId }
        });
        
        const existingLessonIds = existingLessons.map(l => l.id);
        const incomingLessonIds = body.lessons
          .filter((l: any) => l.id && !l.id.startsWith('temp-'))
          .map((l: any) => l.id);
        
        // Delete lessons that are no longer in the incoming data
        const lessonsToDelete = existingLessonIds.filter(id => !incomingLessonIds.includes(id));
        if (lessonsToDelete.length > 0) {
          await tx.lesson.deleteMany({
            where: { id: { in: lessonsToDelete } }
          });
        }
        
        // Process each lesson
        for (const lesson of body.lessons) {
          // Map temp chapter ID to real chapter ID
          const realChapterId = chapterIdMap.get(lesson.chapterId) || lesson.chapterId;
          
          const lessonData = {
            title: lesson.title || 'Untitled Lesson',
            content: lesson.content || '',
            videoUrl: lesson.videoUrl || '',
            order: lesson.order || 1,
            courseId,
            chapterId: realChapterId
          };
          
          if (lesson.id && !lesson.id.startsWith('temp-') && existingLessonIds.includes(lesson.id)) {
            // Update existing lesson
            await tx.lesson.update({
              where: { id: lesson.id },
              data: lessonData
            });
          } else {
            // Create new lesson
            await tx.lesson.create({
              data: lessonData
            });
          }
        }
      }
      
      // Return updated course with fresh curriculum data
      return await tx.course.findUnique({
        where: { id: courseId },
        include: {
          chapters: {
            include: { lessons: true },
            orderBy: { order: 'asc' }
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Curriculum updated successfully'
    });

  } catch (error) {
    console.error('Error updating curriculum:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update curriculum' 
      },
      { status: 500 }
    );
  }
});