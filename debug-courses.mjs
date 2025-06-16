import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking course statuses in database...');
    
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        status: true
      }
    });
    
    console.log('All courses:', JSON.stringify(courses, null, 2));
    
    const statuses = [...new Set(courses.map(course => course.status))];
    console.log('Distinct statuses found:', statuses);
    
    console.log('\nChecking lessons with new status field...');
    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        courseId: true
      },
      take: 5  // Just get first 5
    });
    
    console.log('Sample lessons:', JSON.stringify(lessons, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();