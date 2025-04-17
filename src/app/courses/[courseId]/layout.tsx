import { Metadata } from 'next';
import React from 'react';
import { notFound } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/lib/db/mongodb';

// Generate dynamic metadata for the course detail page
export async function generateMetadata(
  { params }: { params: { courseId: string } }
): Promise<Metadata> {
  // Validate course ID
  if (!params.courseId || !ObjectId.isValid(params.courseId)) {
    return {
      title: 'Course Not Found | Choice E-Learning',
      description: 'The requested course could not be found.',
    };
  }

  try {
    // Fetch course details
    const coursesCollection = await getCollection('courses');
    const course = await coursesCollection.findOne(
      { _id: new ObjectId(params.courseId) },
      { projection: { title: 1, description: 1 } }
    );

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