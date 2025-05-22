'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UserCircleIcon, ClockIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { UserIcon, AcademicCapIcon, DevicePhoneMobileIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useCoursePlaceholder } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';
import { useCoursesQuery } from '@/client/hooks/courses';

interface Instructor {
  id: string;
  name: string;
  email?: string;
}

interface Lesson {
  id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  topics: string[];
  imageUrl?: string;
  instructor: Instructor;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
  totalHours?: number;
  learningPoints?: string[];
  prerequisites?: string[];
}

// Course detail page component
export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const courseId = params.courseId;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Sử dụng React Query hooks
  const { useGetCourse, useEnrollInCourse } = useCoursesQuery();
  const { data: course, isLoading, error } = useGetCourse(courseId);
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useEnrollInCourse(); // Giả định: trong file useCoursesQuery.ts có thêm hook useUnenrollFromCourse
  
  // State variables
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  
  // Use the image placeholder hook
  const { imageUrl, handleImageError } = useCoursePlaceholder(course?.imageUrl);
  
  // Check enrollment status
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const apiClient = (await import('@/client/utils/http/api-client')).default;
        const response = await apiClient.get(`/api/dashboard/user/me/courses`);
        const data = response.data;
        if (data.success) {
          const enrolled = data.courses.some((c) => c.id === courseId);
          setIsEnrolled(enrolled);
        }
      } catch (err: unknown) {
        console.error('Error checking enrollment status:', err);
      }
    };
    
    if (session?.user) {
      checkEnrollmentStatus();
    }
  }, [courseId, session]);
  
  // Handle enrollment
  const handleEnroll = async () => {
    if (!session?.user) {
      // Redirect to login if not authenticated
      router.push(`/login?callbackUrl=/courses/${courseId}`);
      return;
    }
    
    setEnrollmentError(null);
    
    try {
      await enrollMutation.mutateAsync(courseId);
      setIsEnrolled(true);
      // Redirect to learning page instead of dashboard
      router.push(`/courses/${courseId}/learn`);
    } catch (err: unknown) {
      setEnrollmentError(err instanceof Error ? err.message : 'Đăng ký không thành công');
    }
  };

  // Handle unenrollment
  const handleUnenroll = async () => {
    if (!session?.user) {
      return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký khóa học này không? Tiến trình của bạn sẽ được lưu lại, nhưng bạn sẽ cần đăng ký lại để truy cập nội dung khóa học.')) {
      return;
    }
    
    setEnrollmentError(null);
    
    try {
      // Gọi API từ React Query
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      const response = await apiClient.delete(`/api/courses/${courseId}/enroll`);
      const data = response.data;
      
      if (data.success) {
        setIsEnrolled(false);
        // Show success message or redirect
        router.refresh();
      } else {
        setEnrollmentError(data.error || 'Hủy đăng ký không thành công');
      }
    } catch (err: unknown) {
      setEnrollmentError(err instanceof Error ? err.message : 'Hủy đăng ký không thành công');
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <LoadingState variant="page" message="Loading course details..." />
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className='container mx-auto px-4 py-12'>
        <div className='bg-red-100 text-red-700 p-6 rounded-lg mb-8'>
          <h2 className='text-xl font-bold mb-2'>Error</h2>
          <p>{error instanceof Error ? error.message : 'Course not found'}</p>
          <Link href='/courses' className='mt-4 inline-block text-blue-600 hover:underline'>
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Course Hero Section */}
      <section className='pt-24 pb-12 bg-gradient-to-br from-[#000428] to-[#004e92]'>
        <div className='max-w-[980px] mx-auto px-6 md:px-4'>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='md:col-span-2'>
              <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
                {course.title}
              </h1>
              <p className='text-xl text-white/80 max-w-2xl mb-8'>
                {course.description}
              </p>
              <div className='flex flex-wrap gap-4 text-white/70'>
                <span className='flex items-center'>
                  <UserIcon className='h-5 w-5 mr-2' />
                  {course.instructor.name}
                </span>
                <span className='flex items-center'>
                  <ClockIcon className='h-5 w-5 mr-2' />
                  {course.totalHours || '10'} giờ học
                </span>
                <span className='flex items-center'>
                  <BookOpenIcon className='h-5 w-5 mr-2' />
                  {course.lessons.length} bài học
                </span>
                <span className='flex items-center'>
                  <AcademicCapIcon className='h-5 w-5 mr-2' />
                  {course.level || 'Beginner'}
                </span>
              </div>
            </div>
            
            <div className='md:col-span-1'>
              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg relative'>
                  {course.imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={course.title}
                      fill
                      className='object-cover'
                      onError={handleImageError}
                      priority
                    />
                  ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center text-gray-500'>
                      <DocumentTextIcon className='h-12 w-12' />
                    </div>
                  )}
                </div>

                {/* Enrollment or View Course Button */}
                {isEnrolled ? (
                  <div className='space-y-3'>
                    <Link 
                      href={`/courses/${course.id}/learn`}
                      className='w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md font-medium text-center block'
                    >
                      Tiếp tục học
                    </Link>
                    <button 
                      onClick={handleUnenroll}
                      className='w-full bg-transparent border border-red-500 text-red-500 py-2 rounded-md text-sm hover:bg-red-50'
                      disabled={unenrollMutation.isPending}
                    >
                      {unenrollMutation.isPending ? 'Đang xử lý...' : 'Hủy đăng ký'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md font-medium'
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Đang xử lý...' : (course.price > 0 ? `Mua khóa học - ${course.price}` : 'Đăng ký miễn phí')}
                  </button>
                )}

                {/* Error message */}
                {enrollmentError && (
                  <div className='mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md'>
                    {enrollmentError}
                  </div>
                )}
                
                <div className='mt-6 space-y-4'>
                  <div className='flex items-center'>
                    <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
                    <span className='text-gray-700'>Truy cập trọn đời</span>
                  </div>
                  <div className='flex items-center'>
                    <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
                    <span className='text-gray-700'>Học theo tốc độ của bạn</span>
                  </div>
                  <div className='flex items-center'>
                    <CheckCircleIcon className='h-5 w-5 text-green-500 mr-2' />
                    <span className='text-gray-700'>Nội dung cập nhật thường xuyên</span>
                  </div>
                  <div className='flex items-center'>
                    <DevicePhoneMobileIcon className='h-5 w-5 text-green-500 mr-2' />
                    <span className='text-gray-700'>Xem trên mọi thiết bị</span>
                  </div>
                  <div className='flex items-center'>
                    <ChatBubbleLeftRightIcon className='h-5 w-5 text-green-500 mr-2' />
                    <span className='text-gray-700'>Hỗ trợ từ giảng viên</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      <div className='max-w-6xl mx-auto px-6 md:px-4 py-12'>
        <div className='grid md:grid-cols-3 gap-12'>
          <div className='md:col-span-2'>
            {/* Course Topics/Tags */}
            {course.topics && course.topics.length > 0 && (
              <div className='mb-8'>
                <h3 className='text-lg font-medium text-gray-900 mb-3'>Topics</h3>
                <div className='flex flex-wrap gap-2'>
                  {course.topics.map((topic, index) => (
                    <span 
                      key={index} 
                      className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* What You'll Learn */}
            {course.learningPoints && course.learningPoints.length > 0 && (
              <div className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  Bạn sẽ học được gì
                </h2>
                <div className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'>
                  <ul className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {course.learningPoints.map((point, index) => (
                      <li key={index} className='flex'>
                        <CheckCircleIcon className='h-6 w-6 text-green-500 mr-2 flex-shrink-0' />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Prerequisites */}
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className='mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                  Điều kiện tiên quyết
                </h2>
                <div className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'>
                  <ul className='space-y-2'>
                    {course.prerequisites.map((prerequisite, index) => (
                      <li key={index} className='flex'>
                        <PuzzlePieceIcon className='h-6 w-6 text-indigo-500 mr-2 flex-shrink-0' />
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Course Description */}
            <div className='mb-8'>
              <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
                Mô tả khóa học
              </h2>
              <div className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'>
                <div className='prose max-w-none'>
                  <p className='whitespace-pre-line'>{course.description}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course Contents Sidebar */}
          <div className='md:col-span-1'>
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm sticky top-24'>
              <div className='p-4 border-b border-gray-200'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Nội dung khóa học
                </h3>
                <p className='text-sm text-gray-600 mt-1'>
                  {course.lessons.length} bài học • {course.totalHours || '10'} giờ
                </p>
              </div>
              
              <div className='divide-y divide-gray-200 max-h-[500px] overflow-y-auto p-1'>
                {course.lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
                  <div key={lesson.id} className='p-3 hover:bg-gray-50 transition'>
                    <div className='flex items-center'>
                      <div className='h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3'>
                        {index + 1}
                      </div>
                      <div className='flex-grow'>
                        <h4 className='text-gray-900 font-medium'>{lesson.title}</h4>
                        {lesson.videoUrl && (
                          <span className='text-xs text-gray-500 flex items-center mt-1'>
                            <ClockIcon className='h-3 w-3 mr-1' />
                            10 minutes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className='p-4 border-t border-gray-200'>
                {isEnrolled ? (
                  <Link 
                    href={`/courses/${course.id}/learn`}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium text-center block'
                  >
                    Tiếp tục học
                  </Link>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium'
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? 'Đang xử lý...' : 'Đăng ký ngay'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Course Info Card */}
            <div className='bg-white border border-gray-200 rounded-lg shadow-sm mt-6 p-4'>
              <div className='flex justify-between items-center mb-4'>
                <h3 className='text-lg font-medium text-gray-900'>
                  Thông tin khóa học
                </h3>
                <StarIcon className='h-6 w-6 text-yellow-500' />
              </div>
              
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Ngày tạo</span>
                  <span className='text-gray-900'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Cập nhật gần đây</span>
                  <span className='text-gray-900'>
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Cấp độ</span>
                  <span className='text-gray-900'>{course.level || 'Beginner'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Bài học</span>
                  <span className='text-gray-900'>{course.lessons.length}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>Thời lượng</span>
                  <span className='text-gray-900'>{course.totalHours || '10 giờ'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}