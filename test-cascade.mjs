import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get a course with lessons to test
    const courseWithLessons = await prisma.course.findFirst({
      where: {
        lessons: {
          some: {}  // Has at least one lesson
        }
      },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!courseWithLessons) {
      console.log('No course with lessons found');
      return;
    }

    console.log('Testing cascade with course:', courseWithLessons.id);
    console.log('Course title:', courseWithLessons.title);
    console.log('Current course status:', courseWithLessons.status);
    console.log('Lessons before:', courseWithLessons.lessons);

    // Test the cascade function by manually calling it
    console.log('\nPublishing course with cascade...');
    
    const result = await prisma.$transaction(async (tx) => {
      // Update course status to published
      const course = await tx.course.update({
        where: { id: courseWithLessons.id },
        data: { status: 'published' },
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      });
      
      // Update all lessons in the course to published status
      await tx.lesson.updateMany({
        where: { courseId: courseWithLessons.id },
        data: { status: 'published' }
      });
      
      return course;
    });

    console.log('\nAfter cascade:');
    console.log('Course status:', result.status);
    console.log('Lessons after:', result.lessons);

    // Verify the changes
    const verification = await prisma.course.findUnique({
      where: { id: courseWithLessons.id },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    console.log('\nVerification check:');
    console.log('Course status:', verification?.status);
    console.log('All lessons published?', verification?.lessons.every(l => l.status === 'published'));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();