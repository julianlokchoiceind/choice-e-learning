'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatCourseTitle } from '@/shared/utils/courses';
import { useCoursesQuery } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  imageUrl?: string;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  studentIds?: string[];
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  // Sử dụng React Query thay vì state thủ công
  const { useGetCourse, useDeleteCourse } = useCoursesQuery(true);
  
  // Lấy thông tin khóa học
  const {
    data: course,
    isLoading,
    error
  } = useGetCourse(courseId);
  
  // Xử lý xóa khóa học
  const deleteMutation = useDeleteCourse();
  
  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(courseId);
      
      // Redirect to courses page after successful deletion
      router.push('/admin/courses');
      
    } catch (err: unknown) {
      console.error('Error deleting course:', err);
      alert(`Failed to delete course: ${(err as Error).message || 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh]'>
        <LoadingState variant="section" message="Loading course data..." />
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div className='text-center py-10'>
        <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
        <p className='text-gray-600 mb-6'>{error instanceof Error ? error.message : 'Course not found'}</p>
        <Link 
          href='/admin/courses' 
          className='px-4 py-2 bg-[var(--color-primary-text)] text-white rounded-md hover:bg-[var(--color-primary-dark)]'
        >
          Back to All Courses
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className='mb-6'>
        <Link 
          href='/admin/courses' 
          className='inline-flex items-center text-gray-600 hover:text-gray-800'
        >
          <ArrowLeftIcon className='h-4 w-4 mr-1' />
          Back to Courses
        </Link>
        <h1 className='text-2xl font-bold text-gray-800 mt-2'>{formatCourseTitle(course.title)}</h1>
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='h-48 overflow-hidden bg-gray-200'>
              <Image 
                src={course.imageUrl || '/images/courses/course-placeholder.jpg'} 
                alt={formatCourseTitle(course.title)}
                className='w-full h-full object-cover'
                width={500} height={300}
                onError={(e: any) => {
                  (e.target as HTMLImageElement).src = '/images/courses/course-placeholder.jpg';
                }}
              />
            </div>
            
            <div className='p-6'>
              <h2 className='text-xl font-semibold mb-4'>Description</h2>
              <p className='text-gray-600 mb-6'>{course.description}</p>
              
              <div className='mb-6'>
                <h3 className='text-lg font-medium mb-2'>Topics</h3>
                <div className='flex flex-wrap gap-2'>
                  {course.topics && course.topics.length > 0 ? (
                    course.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className='bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] px-2 py-1 rounded-full text-sm'
                      >
                        {topic}
                      </span>
                    ))
                  ) : (
                    <p className='text-gray-500 italic'>No topics listed</p>
                  )}
                </div>
              </div>
              
              <div className='flex justify-end space-x-3'>
                <Link
                  href={`/admin/courses/${courseId}/edit`}
                  className='px-4 py-2 bg-[var(--color-primary-text)] text-white rounded-md hover:bg-[var(--color-primary-dark)] flex items-center'
                >
                  <PencilIcon className='h-4 w-4 mr-2' />
                  Edit Course
                </Link>
                <button
                  onClick={handleDeleteCourse}
                  className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center'
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <span className='inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                  ) : (
                    <TrashIcon className='h-4 w-4 mr-2' />
                  )}
                  Delete Course
                </button>
              </div>
            </div>
          </div>
          
          {/* Lessons Section */}
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='border-b p-4 flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Lessons</h2>
              <Link
                href={`/admin/courses/${courseId}/edit?tab=lessons`}
                className='text-[var(--color-primary-text)] hover:text-[var(--color-primary-dark)] text-sm flex items-center'
              >
                <PencilIcon className='h-4 w-4 mr-1' />
                Manage Lessons
              </Link>
            </div>
            
            <div className='p-4'>
              {/* This would be populated with actual lessons data */}
              <div className='text-center py-6 text-gray-500'>
                To view and manage lessons, click on 'Manage Lessons' above.
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Course Stats */}
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='border-b p-4'>
              <h2 className='text-lg font-semibold'>Course Details</h2>
            </div>
            <div className='p-4 space-y-4'>
              <div className='flex items-center'>
                <CurrencyDollarIcon className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Price</p>
                  <p className='font-medium'>${course.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div className='flex items-center'>
                <BookOpenIcon className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Level</p>
                  <p className='font-medium capitalize'>{course.level}</p>
                </div>
              </div>
              
              <div className='flex items-center'>
                <UserGroupIcon className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Enrolled Students</p>
                  <p className='font-medium'>{course.studentIds?.length || 0}</p>
                </div>
              </div>
              
              <div className='flex items-center'>
                <ClockIcon className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Created</p>
                  <p className='font-medium'>{new Date(course.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className='flex items-center'>
                <ClockIcon className='h-5 w-5 text-gray-500 mr-3' />
                <div>
                  <p className='text-sm text-gray-500'>Last Updated</p>
                  <p className='font-medium'>{new Date(course.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='border-b p-4'>
              <h2 className='text-lg font-semibold'>Quick Actions</h2>
            </div>
            <div className='p-4 space-y-2'>
              <Link
                href={`/admin/courses/${courseId}/edit`}
                className='block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700'
              >
                Edit Course
              </Link>
              
              <Link
                href={`/courses/${courseId}`}
                className='block w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700'
              >
                View Public Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
