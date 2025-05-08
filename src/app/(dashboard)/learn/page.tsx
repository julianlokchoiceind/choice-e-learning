import { Suspense } from 'react';
import { getUserCourses } from '@/server/services/courses/course-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/server/auth/auth-options';
import { redirect } from 'next/navigation';

export default async function LearnPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const userId = session.user.id;
  const enrolledCourses = await getUserCourses(userId);
  
  return (
    <div className='learn-page'>
      <h1>Học tập của tôi</h1>
      
      <Suspense fallback={<div>Đang tải dữ liệu khóa học...</div>}>
        <div className='enrolled-courses'>
          {enrolledCourses.length > 0 ? (
            <div className='course-grid'>
              {enrolledCourses.map((course) => (
                <div key={course.id} className='course-card'>
                  <h3>{course.title}</h3>
                  <a href={`/learn/${course.id}`} className='button primary'>
                    Tiếp tục học
                  </a>
                </div>
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
