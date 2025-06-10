import { Suspense } from 'react';
import { getUserCourses } from '@/server/services/courses/course-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { redirect } from 'next/navigation';
import { CourseCard } from '@/client/components/courses/CourseCard';
import { LoadingState } from '@/client/components/common';

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  const enrolledCourses = await getUserCourses(userId);
  
  return (
    <div className='my-courses-page'>
      <h1>Khóa học của tôi</h1>
      
      <Suspense fallback={<div className="flex justify-center items-center py-12"><LoadingState variant="section" message="Loading courses..." /></div>}>
        <div className='enrolled-courses'>
          {enrolledCourses.length > 0 ? (
            <div className='course-grid'>
              {enrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={true} 
                />
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <p>Bạn chưa đăng ký khóa học nào.</p>
              <a href='/courses' className='button primary'>
                Khám phá khóa học
              </a>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
