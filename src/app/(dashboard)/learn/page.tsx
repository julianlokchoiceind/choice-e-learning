import { CourseProgress } from '@/client/components/learn/CourseProgress';
import { CourseProgress } from '@/client/components/learn/CourseProgress';
import { getUserProgress } from '@/server/services/learn/progress-service';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Learning Dashboard | Choice E-Learning',
  description: 'Track your learning progress across all courses',
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
      <h1>Learning Dashboard</h1>
      <CourseProgress />
    </div>
  );
}