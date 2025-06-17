#!/usr/bin/env node

/**
 * Debug script to check database state after curriculum API error
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const COURSE_ID = '6850cca10c984d3f25bd7ad0';

async function checkDatabaseState() {
  try {
    console.log('=== CHECKING DATABASE STATE ===');
    
    // Check course
    const course = await prisma.course.findUnique({
      where: { id: COURSE_ID },
      include: {
        chapters: {
          include: { lessons: true },
          orderBy: { order: 'asc' }
        },
        lessons: true
      }
    });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    console.log('✅ Course found:');
    console.log('  ID:', course.id);
    console.log('  Title:', course.title);
    console.log('  Status:', course.status);
    console.log('  Created:', course.createdAt);
    console.log('  Updated:', course.updatedAt);
    
    console.log('\n=== CHAPTERS ===');
    if (course.chapters.length === 0) {
      console.log('❌ No chapters found');
    } else {
      course.chapters.forEach((chapter, index) => {
        console.log(`📚 Chapter ${index + 1}:`);
        console.log('  ID:', chapter.id);
        console.log('  Title:', chapter.title);
        console.log('  Order:', chapter.order);
        console.log('  Lessons:', chapter.lessons.length);
        
        chapter.lessons.forEach((lesson, lessonIndex) => {
          console.log(`    📖 Lesson ${lessonIndex + 1}:`);
          console.log('      ID:', lesson.id);
          console.log('      Title:', lesson.title);
          console.log('      Order:', lesson.order);
          console.log('      Status:', lesson.status);
        });
      });
    }
    
    console.log('\n=== ALL LESSONS FOR COURSE ===');
    if (course.lessons.length === 0) {
      console.log('❌ No lessons found');
    } else {
      course.lessons.forEach((lesson, index) => {
        console.log(`📖 Lesson ${index + 1}:`);
        console.log('  ID:', lesson.id);
        console.log('  Title:', lesson.title);
        console.log('  Order:', lesson.order);
        console.log('  ChapterID:', lesson.chapterId);
        console.log('  Status:', lesson.status);
      });
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();