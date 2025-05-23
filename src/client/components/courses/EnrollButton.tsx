'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useAuth } from '@/client/hooks/auth';
import { LoadingState } from '@/client/components/common';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
}

export const EnrollButton = ({ courseId, isEnrolled = false }: EnrollButtonProps) => {
  const router = useRouter();
  
  // Get hooks from useCoursesQuery
  const { useEnrollInCourse } = useCoursesQuery();
  
  // Get authentication state from useAuth
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Use React Query mutations
  const enrollMutation = useEnrollInCourse();
  
  const handleEnroll = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        // Redirect to login page with redirect back to this course
        router.push(`/login?redirectTo=/courses/${courseId}`);
        return;
      }
      
      // Call enrollment mutation
      await enrollMutation.mutateAsync(courseId);
      
      // Redirect to course page or dashboard
      router.push(`/learn/${courseId}`);
      router.refresh();
    } catch (error: unknown) {
      console.error('Error enrolling in course:', error);
      // Error handling is done by the mutation
    }
  };
  
  if (isEnrolled) {
    return (
      <a
        href={`/learn/${courseId}`}
        className='button primary full-width'
      >
        Tiếp tục học
      </a>
    );
  }
  
  return (
    <button
      onClick={handleEnroll}
      disabled={enrollMutation.isPending || isLoading}
      className='button primary full-width'
    >
      {enrollMutation.isPending ? (
        <LoadingState variant="button" message="Đang xử lý..." />
      ) : (
        'Đăng ký khóa học'
      )}
    </button>
  );
};

export default EnrollButton;