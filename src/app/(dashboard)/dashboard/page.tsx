'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRightIcon, 
  BookOpenIcon, 
  AcademicCapIcon,
  UserCircleIcon,
  FireIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { UserCourseStats } from '@/shared/types/courses/course';
import { UserAchievement } from '@/shared/types/achievement';
import { UserLoginStreak } from '@/client/components/dashboard/UserLoginStreak';
import { LoadingState } from '@/client/components/common';
import { useUserQuery } from '@/client/hooks/user';
import { useDashboardQuery } from '@/client/hooks/dashboard';

// Define EnrolledCourse type if it's not available
interface EnrolledCourse {
  id: string;
  title: string;
  imageUrl: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

// Mock data for upcoming deadlines (will be replaced with real data later)
const mockUpcomingDeadlines = [
  { id: '1', title: 'Complete JavaScript Assignment', course: 'JavaScript Fundamentals', dueDate: '2024-06-30' },
  { id: '2', title: 'React Project Submission', course: 'React for Beginners', dueDate: '2024-07-15' },
];

export default function Dashboard() {
  // Use React Query hooks
  const { useGetCurrentUser, useGetUserLoginStreak } = useUserQuery();
  const { useGetUserStats, useGetEnrolledCourses, useGetUserAchievements } = useDashboardQuery();
  
  // Get current user with robust error handling
  const { 
    data: currentUser, 
    isLoading: isLoadingUser,
    error: userError,
    status: userStatus,
    refetch: refetchUser
  } = useGetCurrentUser();
  
  // Monitor session status
  const [sessionIssue, setSessionIssue] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Get user login streak directly from React Query
  const {
    data: userLoginStreak = 0,
    isLoading: isLoadingStreak,
    error: streakError 
  } = useGetUserLoginStreak();
  
  // Effect to handle authentication 
  useEffect(() => {
    // If user is not loading but there's no user data, we have a session issue
    if (!isLoadingUser && userStatus === 'error') {
      setSessionIssue(true);
      // Try to refetch user data
      refetchUser();
    }
    
    // Mark session as checked once we have a definitive status
    if (!isLoadingUser && (userStatus === 'success' || userStatus === 'error')) {
      setSessionChecked(true);
    }
  }, [isLoadingUser, userStatus, refetchUser]);

  // Effect to handle session issues
  useEffect(() => {
    if (userError) {
      console.error('Authentication error detected in dashboard:', userError);
      setSessionIssue(true);
      
      // If error is authentication-related, try to refetch more aggressively
      if (userError.message?.includes('authentication') || userError.message?.includes('unauthorized')) {
        console.log('Authentication error detected, attempting immediate refetch...');
        refetchUser();
      }
    }
    
    // Reset session issue flag when user data loads successfully
    if (currentUser && sessionIssue) {
      console.log('Session recovered, user data loaded successfully');
      setSessionIssue(false);
    }
    
    // Add manual refetch if needed for session timing issues
    if ((userStatus === 'error' || !currentUser) && status === 'authenticated') {
      const timer = setTimeout(() => {
        console.log('Attempting to refetch user data after delay...');
        refetchUser();
      }, 1500); // Reduced timeout for faster recovery
      
      return () => clearTimeout(timer);
    }
  }, [userStatus, userError, currentUser, refetchUser, sessionIssue, status]);
  
  // Trigger other queries only when we have user data
  useEffect(() => {
    if (currentUser && currentUser.id) {
      console.log('User authenticated, triggering dashboard data fetch');
      // No need to do anything explicit as the queries will auto-trigger
      // based on their dependencies on the user ID
    } else if (status === 'authenticated' && !currentUser) {
      // If we're authenticated but don't have user data, try to refetch
      console.log('Session authenticated but missing user data, refetching...');
      refetchUser();
    }
  }, [currentUser, status, refetchUser]);
  
  // Get user stats
  const {
    data: stats = {
      coursesCompleted: 0,
      lessonsCompleted: 0,
      totalHoursLearned: 0,
      currentStreak: 0
    },
    isLoading: isLoadingStats,
    error: statsError
  } = useGetUserStats();
  
  // Get enrolled courses with proper typing
  const {
    data: enrolledCoursesData,
    isLoading: isLoadingCourses,
    error: coursesError
  } = useGetEnrolledCourses();
  
  // Type safe enrolled courses
  const enrolledCourses = (enrolledCoursesData || []) as EnrolledCourse[];
  
  // Get achievements with proper typing
  const {
    data: achievementsData,
    isLoading: isLoadingAchievements,
    error: achievementsError
  } = useGetUserAchievements();
  
  // Type safe achievements
  const achievements = (achievementsData || []) as UserAchievement[];
  
  // Combine loading states - distinguish between initial loading and session loading
  const isInitialLoading = isLoadingUser || isLoadingStats || isLoadingCourses || isLoadingAchievements || isLoadingStreak;
  
  // Check if we're waiting for session to be ready
  const isSessionLoading = status === 'loading';
  
  // Combined loading state
  const isLoading = isInitialLoading || isSessionLoading;
  
  // Handle errors - but don't treat authentication errors as fatal errors during initial load
  const isAuthError = userError && userError.message?.includes('authentication');
  const hasError = (userError && !isAuthError) || statsError || coursesError || achievementsError;

  // Show loading state while checking authentication
  if ((isLoadingUser || status === 'loading') && !sessionChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }
  
  // If we have auth errors but session is still loading, show a different loading message
  if (isAuthError && isSessionLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingState variant="page" message="Verifying your session..." />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold mb-4'>You need to be logged in to view this page</h1>
        <Link 
          href='/login' 
          className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition'
        >
          Log in
        </Link>
      </div>
    );
  }

  if (hasError) {
    // Extract error messages properly with type checking
    const errorMessage = 
      (userError instanceof Error ? userError.message : '') ||
      (statsError instanceof Error ? statsError.message : '') ||
      (coursesError instanceof Error ? coursesError.message : '') ||
      (achievementsError instanceof Error ? achievementsError.message : '') ||
      'An error occurred loading your dashboard';
      
    return (
      <div className='min-h-screen flex flex-col items-center justify-center'>
        <h1 className='text-2xl font-bold mb-4'>Something went wrong</h1>
        <p className='text-red-500 mb-4'>{errorMessage}</p>
        <Link 
          href='/' 
          className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition'
        >
          Go Home
        </Link>
      </div>
    );
  }

  // Helper function to get icon for achievement
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'first_login':
        return <CheckCircleIcon className='w-6 h-6 text-green-500' />;
      case 'course_started':
        return <BookOpenIcon className='w-6 h-6 text-blue-500' />;
      case 'course_completed':
        return <AcademicCapIcon className='w-6 h-6 text-purple-500' />;
      case 'quick_learner':
        return <FireIcon className='w-6 h-6 text-orange-500' />;
      case 'daily_streak':
        return <FireIcon className='w-6 h-6 text-red-500' />;
      case 'streak':
        return <FireIcon className='w-6 h-6 text-red-500' />;
      default:
        return <CheckCircleIcon className='w-6 h-6 text-gray-500' />;
    }
  };

  return (
    <div className='bg-gray-50 min-h-screen'>
      {/* Header section */}
      <div className='bg-indigo-600 text-white py-6'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row md:justify-between md:items-center'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold'>
                Welcome back, {currentUser?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className='mt-1 text-indigo-100'>
                Track your progress and continue your learning journey
              </p>
            </div>
            <div className='mt-4 md:mt-0'>
              <Link 
                href='/courses' 
                className='inline-flex items-center bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition'
              >
                Explore Courses
                <ArrowRightIcon className='ml-2 h-4 w-4' />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-green-100 text-green-600 mr-4'>
                <BookOpenIcon className='h-6 w-6' />
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Courses Completed</p>
                <p className='text-2xl font-bold'>{stats.coursesCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-blue-100 text-blue-600 mr-4'>
                <AcademicCapIcon className='h-6 w-6' />
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Lessons Completed</p>
                <p className='text-2xl font-bold'>{stats.lessonsCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-purple-100 text-purple-600 mr-4'>
                <ClockIcon className='h-6 w-6' />
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Hours Learned</p>
                <p className='text-2xl font-bold'>{stats.totalHoursLearned}</p>
              </div>
            </div>
          </div>
          
          <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-100'>
            <div className='flex items-center'>
              <div className='p-3 rounded-full bg-orange-100 text-orange-600 mr-4'>
                <FireIcon className='h-6 w-6' />
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Current Streak</p>
                <p className='text-2xl font-bold'>{userLoginStreak || stats.currentStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area - 2 column layout */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left column - Your courses */}
          <div className='lg:col-span-2'>
            <h2 className='text-xl font-bold mb-4'>Your Courses</h2>
            <div className='bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden'>
              {enrolledCourses.length > 0 ? (
                <div className='divide-y divide-gray-200'>
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className='p-4 transition hover:bg-gray-50'>
                      <div className='flex flex-col sm:flex-row items-start'>
                        <div className='flex-shrink-0 w-full sm:w-32 h-24 mb-4 sm:mb-0 sm:mr-4'>
                          <Image 
                            src={course.imageUrl || '/images/courses/course-placeholder.jpg'} 
                            alt={course.title || 'Course image'}
                            className='w-full h-full object-cover rounded-md'
                            width={500} height={300}
                            onError={(e: any) => {
                              (e.target as HTMLImageElement).src = '/images/courses/course-placeholder.jpg';
                            }}
                          />
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-medium mb-1'>{course.title}</h3>
                          <div className='flex items-center mb-2 text-sm text-gray-500'>
                            <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2.5 mb-3'>
                            <div 
                              className='bg-indigo-600 h-2.5 rounded-full' 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className='flex justify-between items-center'>
                            <span className='text-sm font-semibold text-indigo-600'>{course.progress}% complete</span>
                            <Link
                              href={`/courses/${course.id}`}
                              className='text-sm font-medium text-indigo-600 hover:text-indigo-800'
                            >
                              Continue Learning
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-8 text-center'>
                  <BookOpenIcon className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-lg font-medium text-gray-900'>No courses yet</h3>
                  <p className='mt-1 text-sm text-gray-500'>You haven&apos;t enrolled in any courses yet.</p>
                  <div className='mt-6'>
                    <Link
                      href='/courses'
                      className='inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700'
                    >
                      Browse Courses
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Achievements and deadlines */}
          <div className='space-y-8'>
            {/* Login Streak */}
            <UserLoginStreak loginStreak={userLoginStreak} />
            
            {/* Achievements section */}
            <div>
              <h2 className='text-xl font-bold mb-4'>Your Achievements</h2>
              <div className='bg-white shadow-sm rounded-lg border border-gray-100 p-4'>
                {achievements.length > 0 ? (
                  <div className='divide-y divide-gray-100'>
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className='flex items-center py-3 border-b border-gray-100 last:border-0'>
                        <div className='mr-3'>
                          {getAchievementIcon(achievement.type)}
                        </div>
                        <div>
                          <p className='font-medium'>{achievement.title}</p>
                          <p className='text-sm text-gray-500'>
                            Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-6'>
                    <AcademicCapIcon className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 text-lg font-medium text-gray-900'>No achievements yet</h3>
                    <p className='text-sm text-gray-500'>Complete courses to earn achievements</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Upcoming deadlines */}
            <div>
              <h2 className='text-xl font-bold mb-4'>Upcoming Deadlines</h2>
              <div className='bg-white shadow-sm rounded-lg border border-gray-100 p-4'>
                {mockUpcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className='py-3 border-b border-gray-100 last:border-0'>
                    <p className='font-medium'>{deadline.title}</p>
                    <p className='text-sm text-gray-500 mb-1'>Course: {deadline.course}</p>
                    <div className='flex items-center text-sm'>
                      <ClockIcon className='h-4 w-4 text-red-500 mr-1' />
                      <span className='text-red-500'>
                        Due {new Date(deadline.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {mockUpcomingDeadlines.length === 0 && (
                  <div className='text-center py-6'>
                    <p className='text-gray-500'>No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Continue learning suggestion */}
            <div className='bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-lg shadow-sm border border-indigo-200'>
              <h3 className='font-semibold text-lg text-indigo-800 mb-2'>Ready to continue?</h3>
              <p className='text-indigo-700 mb-4'>Pick up where you left off or explore new courses.</p>
              <div className='flex space-x-3'>
                <Link 
                  href='/courses/my'
                  className='bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700 transition'
                >
                  My Courses
                </Link>
                <Link 
                  href='/courses'
                  className='bg-white text-indigo-600 text-sm px-4 py-2 rounded-md hover:bg-indigo-50 transition'
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 