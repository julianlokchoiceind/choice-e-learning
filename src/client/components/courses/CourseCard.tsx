'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/shared/types/courses/course';
import { useCoursesQuery } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';

interface CourseCardProps {
  course: Partial<Course> & { id: string; title: string };
  isEnrolled?: boolean;
}

export const CourseCard = ({ course, isEnrolled = false }: CourseCardProps) => {
  const router = useRouter();
  
  // Get hooks from useCoursesQuery
  const { useEnrollInCourse } = useCoursesQuery();
  
  // Use React Query mutations
  const enrollMutation = useEnrollInCourse();
  
  const handleEnroll = async () => {
    try {
      await enrollMutation.mutateAsync(course.id);
      router.push(`/learn/${course.id}`);
      router.refresh();
    } catch (error: unknown) {
      console.error('Error enrolling in course:', error);
      // Error handling is done by the mutation
    }
  };
  
  return (
    <div className='course-card bg-white rounded-lg shadow-md overflow-hidden'>
      <div className='relative h-48 bg-gray-200'>
        <Image 
          src={course.imageUrl || '/images/courses/course-placeholder.jpg'} 
          alt={course.title || 'Course image'}
          className='h-full w-full object-cover'
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e: any) => {
            (e.target as HTMLImageElement).src = '/images/courses/course-placeholder.jpg';
          }}
        />
      </div>
      <div className='p-4'>
        <h3 className='text-lg font-semibold mb-2'>{course.title}</h3>
        {course.description && <p className='text-gray-600 mb-4 line-clamp-2'>{course.description}</p>}
        
        {course.level && (
          <div className='mb-3'>
            <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
              {typeof course.level === 'string' 
                ? course.level.charAt(0).toUpperCase() + course.level.slice(1) 
                : 'All Levels'}
            </span>
          </div>
        )}
        
        <div className='mt-4'>
          {!isEnrolled ? (
            <button 
              onClick={handleEnroll} 
              disabled={enrollMutation.isPending}
              className='w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
            >
              {enrollMutation.isPending ? <LoadingState variant="button" message="Đang xử lý..." /> : 'Đăng ký ngay'}
            </button>
          ) : (
            <Link href={`/learn/${course.id}`} className='block w-full text-center py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md transition-colors'>
              Tiếp tục học
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;