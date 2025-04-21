import { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';

// Generate dynamic metadata for the course detail page
export async function generateMetadata(
  { params }: { params: { courseId: string } }
): Promise<Metadata> {
  // Validate course ID
  if (!params.courseId) {
    return {
      title: 'Course Not Found | Choice E-Learning',
      description: 'The requested course could not be found.',
    };
  }

  try {
    // Fetch course details using Prisma
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      select: { title: true, description: true }
    });

    if (!course) {
      return {
        title: 'Course Not Found | Choice E-Learning',
        description: 'The requested course could not be found.',
      };
    }

    // Return dynamically generated metadata
    return {
      title: `${course.title} | Choice E-Learning`,
      description: course.description.substring(0, 155) + (course.description.length > 155 ? '...' : ''),
    };
  } catch (error) {
    console.error('Error generating course metadata:', error);
    return {
      title: 'Course Details | Choice E-Learning',
      description: 'View details about this course and enroll to start learning.',
    };
  }
}

export default function CourseDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="course-detail-layout">
      {children}
    </div>
  );
} 