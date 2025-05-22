'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircleIcon, 
  PlayCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { CourseCurriculumSidebar } from '@/client/components/layout/CourseCurriculumSidebar';
import { LoadingState } from '@/client/components/common';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useLessonsQuery } from '@/client/hooks/learn';
import apiClient from '@/client/utils/http/api-client';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  completed: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseProgress {
  currentLesson: string;
  completedLessons: string[];
  progress: number;
}

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Sử dụng React Query hooks
  const { useGetCourse } = useCoursesQuery();
  const { useMarkLessonComplete } = useLessonsQuery();
  
  // Get course data using React Query
  const {
    data: courseData,
    isLoading: isLoadingCourse,
    error: courseError
  } = useGetCourse(courseId);
  
  // Get course progress using React Query
  const {
    data: progress = null,
    isLoading: isLoadingProgress,
    error: progressError,
    refetch: refetchProgress
  } = useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/courses/${courseId}/progress`);
      return response.data.progress as CourseProgress;
    },
    enabled: !!courseId && !!session?.user && !!courseData,
  });
  
  // Check enrollment using React Query
  const {
    data: isEnrolled,
    isLoading: isLoadingEnrollment,
    error: enrollmentError
  } = useQuery({
    queryKey: ['enrollment', courseId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/dashboard/user/me/courses`);
      const data = response.data;
      return data.success && data.courses.some((c: { id: string }) => c.id === courseId);
    },
    enabled: !!courseId && !!session?.user,
  });
  
  // State variables
  const [currentModule, setCurrentModule] = useState<number>(0);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Sử dụng mutation để đánh dấu bài học hoàn thành
  const markLessonCompleteMutation = useMarkLessonComplete();
  
  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/courses/${courseId}/learn`);
    }
  }, [status, courseId, router]);
  
  // Redirect if not enrolled
  useEffect(() => {
    if (isEnrolled === false && !isLoadingEnrollment) {
      router.push(`/courses/${courseId}`);
    }
  }, [isEnrolled, isLoadingEnrollment, courseId, router]);
  
  // Set current module and lesson based on progress
  useEffect(() => {
    if (progress?.currentLesson && courseData) {
      let foundModule = -1;
      let foundLesson = -1;
      
      for (let i = 0; i < (courseData?.modules?.length || 0); i++) {
        const lessonIndex = courseData?.modules[i].lessons.findIndex(l => l.id === progress.currentLesson);
        if (lessonIndex !== undefined && lessonIndex !== -1) {
          foundModule = i;
          foundLesson = lessonIndex;
          break;
        }
      }
      
      if (foundModule !== -1 && foundLesson !== -1) {
        setCurrentModule(foundModule);
        setCurrentLesson(foundLesson);
      }
    }
  }, [progress, courseData]);
  
  // Mark lesson as completed
  const markLessonAsCompleted = async () => {
    if (!courseData) return;
    
    const currentLessonId = courseData.modules[currentModule].lessons[currentLesson].id;
    
    try {
      await markLessonCompleteMutation.mutateAsync(currentLessonId);
      
      // Refetch progress after marking lesson as complete
      refetchProgress();
    } catch (err: unknown) {
      console.error('Failed to mark lesson as completed', err);
    }
  };
  
  // Navigate to next lesson
  const goToNextLesson = () => {
    if (!courseData) return;
    
    // First try to go to the next lesson in the current module
    if (currentLesson < courseData.modules[currentModule].lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } 
    // Otherwise go to the first lesson of the next module
    else if (currentModule < courseData.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
    
    // Auto scroll to top
    window.scrollTo(0, 0);
  };
  
  // Navigate to previous lesson
  const goToPreviousLesson = () => {
    if (!courseData) return;
    
    // First try to go to the previous lesson in the current module
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    } 
    // Otherwise go to the last lesson of the previous module
    else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setCurrentLesson(courseData.modules[currentModule - 1].lessons.length - 1);
    }
    
    // Auto scroll to top
    window.scrollTo(0, 0);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModule(moduleIndex);
    setCurrentLesson(lessonIndex);
    window.scrollTo(0, 0);
  };

  // Show loading state when data is being fetched
  const isLoading = isLoadingCourse || isLoadingProgress || isLoadingEnrollment || status === 'loading';
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingState variant='page' message='Loading course content...' />
      </div>
    );
  }

  // Show error state if any errors occurred
  const error = courseError || progressError || enrollmentError;
  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-red-500' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-red-700'>
                {error instanceof Error ? error.message : 'An error occurred while loading the course. Please try again later.'}
              </p>
            </div>
          </div>
        </div>
        <Link href={`/courses/${courseId}`} className='text-indigo-600 hover:text-indigo-800'>
          &larr; Back to course details
        </Link>
      </div>
    );
  }

  // If course data is not available, show a message
  if (!courseData || !courseData.modules || courseData.modules.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-yellow-500' viewBox='0 0 20 20' fill='currentColor'>
                <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-yellow-700'>
                This course does not have any content yet. Please check back later.
              </p>
            </div>
          </div>
        </div>
        <Link href='/courses' className='text-indigo-600 hover:text-indigo-800'>
          &larr; Browse other courses
        </Link>
      </div>
    );
  }

  // Get current lesson data
  const currentModuleData = courseData.modules[currentModule];
  const currentLessonData = currentModuleData.lessons[currentLesson];
  const isLessonCompleted = currentLessonData.completed || (progress?.completedLessons || []).includes(currentLessonData.id);

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Main content area */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Sidebar */}
        <div className={`bg-gray-50 border-r border-gray-200 ${isSidebarCollapsed ? 'hidden' : 'w-full md:w-80 lg:w-96'} transition-all duration-300 overflow-y-auto`}>
          <CourseCurriculumSidebar
            course={courseData}
            currentModule={currentModule}
            currentLesson={currentLesson}
            progress={progress}
            navigateToLesson={navigateToLesson}
          />
        </div>

        {/* Lesson content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Top navigation bar */}
          <div className='bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-10'>
            <button
              onClick={toggleSidebar}
              className='text-gray-500 hover:text-gray-700 focus:outline-none'
            >
              <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                {isSidebarCollapsed ? (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                ) : (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                )}
              </svg>
            </button>
            <div className='text-sm text-gray-500'>
              {currentModule + 1}/{courseData.modules.length} · {currentLesson + 1}/{currentModuleData.lessons.length}
            </div>
            <Link href={`/courses/${courseId}`} className='text-indigo-600 hover:text-indigo-800 text-sm'>
              Exit Course
            </Link>
          </div>

          {/* Lesson content */}
          <div className='p-4 sm:p-6 lg:p-8'>
            <div className='max-w-3xl mx-auto'>
              <div className='mb-6'>
                <h1 className='text-2xl sm:text-3xl font-bold mb-2'>{currentLessonData.title}</h1>
                <div className='flex items-center text-sm text-gray-500'>
                  <ClockIcon className='h-4 w-4 mr-1' />
                  <span>{currentLessonData.duration}</span>
                  {isLessonCompleted && (
                    <span className='ml-4 flex items-center text-green-600'>
                      <CheckCircleSolid className='h-4 w-4 mr-1' />
                      Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Video content if available */}
              {currentLessonData.videoUrl && (
                <div className='mb-8 bg-black rounded-lg overflow-hidden aspect-video'>
                  <iframe
                    className='w-full h-full'
                    src={currentLessonData.videoUrl}
                    title={currentLessonData.title}
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Text content */}
              <div className='prose max-w-none mb-8'>
                {currentLessonData.content ? (
                  <div dangerouslySetInnerHTML={{ __html: currentLessonData.content }}></div>
                ) : (
                  <p className='text-gray-500 italic'>No additional content for this lesson.</p>
                )}
              </div>

              {/* Navigation and completion buttons */}
              <div className='flex items-center justify-between border-t border-gray-200 pt-6 mt-8'>
                <button
                  onClick={goToPreviousLesson}
                  disabled={currentModule === 0 && currentLesson === 0}
                  className={`flex items-center ${
                    currentModule === 0 && currentLesson === 0
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-indigo-600 hover:text-indigo-800'
                  }`}
                >
                  <ArrowLeftIcon className='h-5 w-5 mr-1' />
                  Previous Lesson
                </button>

                <div className='flex space-x-4'>
                  {!isLessonCompleted && (
                    <button
                      onClick={markLessonAsCompleted}
                      className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center'
                      disabled={markLessonCompleteMutation.isPending}
                    >
                      {markLessonCompleteMutation.isPending ? (
                        <span className='inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></span>
                      ) : (
                        <CheckCircleIcon className='h-5 w-5 mr-2' />
                      )}
                      Mark as Complete
                    </button>
                  )}

                  <button
                    onClick={goToNextLesson}
                    disabled={currentModule === courseData.modules.length - 1 && currentLesson === currentModuleData.lessons.length - 1}
                    className={`flex items-center ${
                      currentModule === courseData.modules.length - 1 && currentLesson === currentModuleData.lessons.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    Next Lesson
                    <ArrowRightIcon className='h-5 w-5 ml-1' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}