import { Suspense } from 'react';
import { EnrolledCoursesSection } from '@/client/components/dashboard/EnrolledCoursesSection';
import { LoadingState } from '@/client/components/common/LoadingState';
import { getUserCourses } from '@/server/services/dashboard/course-service';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'My Courses | Choice E-Learning',
  description: 'View your enrolled courses and track your learning progress',
};

interface PageProps {
  params: {
    : string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  // Metadata implementation
}

export default async function Page({ params }: PageProps) {
  
  
  
  
  return (
    <div className="page-container">
      <h1>My Courses</h1>
      <Suspense fallback={<LoadingState />}>
        <EnrolledCoursesSection />
      </Suspense>
    </div>
  );
}