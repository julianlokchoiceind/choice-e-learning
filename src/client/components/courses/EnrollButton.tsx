'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
}

export const EnrollButton = ({ courseId, isEnrolled = false }: EnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      // Call API to enroll
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to enroll');
      }
      
      // Redirect to course page or dashboard
      router.push(`/learn/${courseId}`);
      router.refresh();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isEnrolled) {
    return (
      <a
        href={`/learn/${courseId}`}
        className="button primary full-width"
      >
        Tiếp tục học
      </a>
    );
  }
  
  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className="button primary full-width"
    >
      {isLoading ? 'Đang xử lý...' : 'Đăng ký khóa học'}
    </button>
  );
};

export default EnrollButton;