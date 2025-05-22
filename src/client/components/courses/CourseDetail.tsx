'use client';

import { Course, CourseWithChaptersAndLessons } from '@/shared/types/courses/course';
import { EnrollButton } from './EnrollButton';

interface CourseDetailProps {
  course: CourseWithChaptersAndLessons;
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
        
        {course.chapters && course.chapters.length > 0 ? (
          <div className='course-chapters'>
            <h2>Nội dung khóa học</h2>
            {course.chapters.map((chapter) => (
              <div key={chapter.id} className="course-chapter">
                <h3>{chapter.title}</h3>
                {chapter.lessons && chapter.lessons.length > 0 && (
                  <ul className="chapter-lessons">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id} className="chapter-lesson">
                        {lesson.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : course.lessons && course.lessons.length > 0 ? (
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
        ) : null}
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