'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useAuthQuery } from '@/client/hooks/auth';
import { LoadingState } from '@/client/components/common';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
}

export const EnrollButton = ({ courseId, isEnrolled = false }: EnrollButtonProps) => {
  const router = useRouter();
  
  // Get hooks from useCoursesQuery
  const { useEnrollInCourse } = useCoursesQuery();
  
  // Get hooks from useAuthQuery
  const { useGetCurrentUser } = useAuthQuery();
  
  // Use React Query mutations
  const enrollMutation = useEnrollInCourse();
  
  // Use React Query to check authentication status
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUser();
  
  const handleEnroll = async () => {
    try {
      // Check if user is authenticated
      if (!currentUser) {
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
      disabled={enrollMutation.isPending || isLoadingUser}
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