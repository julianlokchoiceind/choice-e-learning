'use client';

import { Course } from '@/shared/types/courses/course';
import { EnrollButton } from './EnrollButton';

interface CourseDetailProps {
  course: Course;
  isEnrolled?: boolean;
}

export const CourseDetail = ({ course, isEnrolled = false }: CourseDetailProps) => {
  return (
    <div className='course-detail'>
      <div className='course-detail-header'>
        <h1>{course.title}</h1>
        
        <div className='course-meta'>
          <span className='course-level'>{course.level}</span>
          <span className='course-duration'>{course.duration} phút</span>
        </div>
      </div>
      
      <div className='course-detail-content'>
        <div className='course-description'>
          <h2>Mô tả khóa học</h2>
          <p>{course.description}</p>
        </div>
        
        {course.lessons && course.lessons.length > 0 && (
          <div className='course-lessons'>
            <h2>Nội dung khóa học</h2>
            <ul>
              {course.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <h3>{lesson.title}</h3>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className='course-detail-footer'>
        <EnrollButton 
          courseId={course.id} 
          isEnrolled={isEnrolled} 
        />
      </div>
    </div>
  );
};

export default CourseDetail;