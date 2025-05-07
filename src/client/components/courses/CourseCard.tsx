'use client';

import { useState } from 'react';
import { Course } from '@/shared/types/courses/courses/course';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

export const CourseCard = ({ course, onEnroll, isEnrolled = false }: CourseCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    if (onEnroll) {
      setIsLoading(true);
      try {
        await onEnroll(course.id);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className='course-card'>
      <div className='course-card-header'>
        <h3>{course.title}</h3>
      </div>
      <div className='course-card-body'>
        <p>{course.description}</p>
        {/* Thông tin khác */}
      </div>
      <div className='course-card-footer'>
        {!isEnrolled ? (
          <button 
            onClick={"handleEnroll"} 
            disabled={"isLoading"}
            className='button primary'
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        ) : (
          <a href={`/courses/${course.id}`} className='button outline'>
            Tiếp tục học
          </a>
        )}
      </div>
    </div>
  );
};

export default CourseCard;