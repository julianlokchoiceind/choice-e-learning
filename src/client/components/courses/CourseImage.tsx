'use client';

import Image from 'next/image';
import { Course } from '@/shared/types/courses/course';

interface CourseImageProps {
  course?: Partial<Course>;
  src?: string;
  alt?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * CourseImage component for displaying course images consistently across the application
 * Can be used either by passing a course object or src/alt directly
 */
const CourseImage = ({ 
  course, 
  src, 
  alt, 
  className = '', 
  size = 'medium' 
}: CourseImageProps) => {
  // Determine image source
  const imageSrc = src || course?.imageUrl || '/images/courses/course-placeholder.jpg';
  // Determine alt text
  const imageAlt = alt || course?.title || 'Course image';
  
  // Determine size-based styling
  const sizeStyles = {
    small: 'h-10 w-10',
    medium: 'h-32 w-full',
    large: 'h-48 w-full'
  };
  
  // Combined className with consistent object-cover
  const combinedClassName = `relative ${sizeStyles[size]} ${className}`;
  
  return (
    <div className={combinedClassName}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover rounded-md"
        onError={(e: any) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== '/images/courses/course-placeholder.jpg') {
            target.src = '/images/courses/course-placeholder.jpg';
          }
        }}
        priority={size === 'large'} // Prioritize large images for better UX
      />
    </div>
  );
};

export default CourseImage; 