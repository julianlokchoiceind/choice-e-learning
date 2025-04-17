"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UserCircleIcon, ClockIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { UserIcon, AcademicCapIcon, DevicePhoneMobileIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

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
  
  // State variables
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [unenrolling, setUnenrolling] = useState(false);
  
  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        if (data.success) {
          setCourse(data.course);
        } else {
          setError(data.error || 'Failed to fetch course details');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);
  
  // Check enrollment status
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/users/me/courses`);
        if (!response.ok) {
          throw new Error('Failed to fetch enrollment status');
        }
        
        const data = await response.json();
        if (data.success) {
          const enrolled = data.courses.some((c: any) => c.id === courseId);
          setIsEnrolled(enrolled);
        }
      } catch (err) {
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
    
    setEnrolling(true);
    setEnrollmentError(null);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEnrolled(true);
        // Redirect to learning page instead of dashboard
        router.push(`/courses/${courseId}/learn`);
      } else {
        setEnrollmentError(data.error || 'Failed to enroll in course');
      }
    } catch (err) {
      setEnrollmentError((err as Error).message);
    } finally {
      setEnrolling(false);
    }
  };

  // Handle unenrollment
  const handleUnenroll = async () => {
    if (!session?.user) {
      return;
    }
    
    if (!confirm('Are you sure you want to unenroll from this course? Your progress will be saved, but you will need to re-enroll to access the course content.')) {
      return;
    }
    
    setUnenrolling(true);
    setEnrollmentError(null);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEnrolled(false);
        // Show success message or redirect
        router.refresh();
      } else {
        setEnrollmentError(data.error || 'Failed to unenroll from course');
      }
    } catch (err) {
      setEnrollmentError((err as Error).message);
    } finally {
      setUnenrolling(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Course not found'}</p>
          <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-[#000428] to-[#004e92]">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-4 text-white/70">
            <span className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              {course.instructor.name}
            </span>
            <span className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              {course.totalHours || 0} hours
            </span>
            <span className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              {course.level}
            </span>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {course.learningPoints && course.learningPoints.map((point: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-[#0066cc] mr-2 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-6">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-[#1d1d1f]">
                {course.prerequisites && course.prerequisites.map((prereq: string, index: number) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>

            {/* Sidebar */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-[#1d1d1f]">${course.price}</span>
                <p className="text-[#86868b]">Lifetime Access</p>
              </div>
              {isEnrolled ? (
                <>
                  <Link href={`/courses/${courseId}/learn`} className="w-full block text-center bg-[#0066cc] text-white font-medium py-3 px-6 rounded-full hover:bg-[#0077ed] transition-colors mb-4">
                    Continue Learning
                  </Link>
                  <button 
                    onClick={handleUnenroll}
                    disabled={unenrolling}
                    className="w-full bg-white text-red-600 font-medium py-3 px-6 rounded-full border border-red-600 hover:bg-red-50 transition-colors"
                  >
                    {unenrolling ? 'Unenrolling...' : 'Unenroll from Course'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-[#0066cc] text-white font-medium py-3 px-6 rounded-full hover:bg-[#0077ed] transition-colors mb-4 disabled:opacity-70"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
              )}
              {!isEnrolled && (
              <button className="w-full bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full border border-[#0066cc] hover:bg-[#f5f5f7] transition-colors">
                Add to Wishlist
              </button>
              )}

              {enrollmentError && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {enrollmentError}
                </div>
              )}

              <div className="mt-6 space-y-4 text-[#1d1d1f]">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Community support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}