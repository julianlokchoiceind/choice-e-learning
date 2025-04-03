import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  AcademicCapIcon, 
  BookmarkIcon, 
  CogIcon, 
  UserCircleIcon, 
  BellIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Dashboard | Choice E-Learning',
  description: 'Track your progress, manage your courses, and update your profile',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="bg-white shadow rounded-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden">
            <Image 
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="User profile"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, Michael!</h1>
            <p className="text-gray-600 mb-4">Continue your learning journey and track your progress.</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-gray-700">4 Courses Enrolled</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-gray-700">2 Certificates Earned</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-gray-700">25 Hours Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white shadow rounded-lg p-4">
            <nav className="space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center px-3 py-2 text-gray-900 rounded-md bg-indigo-50 font-medium"
              >
                <AcademicCapIcon className="h-5 w-5 text-indigo-600 mr-3" />
                My Courses
              </Link>
              <Link 
                href="/dashboard/wishlist" 
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <BookmarkIcon className="h-5 w-5 text-gray-400 mr-3" />
                Wishlist
              </Link>
              <Link 
                href="/dashboard/notifications" 
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                Notifications
                <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  3
                </span>
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <UserCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                Profile Settings
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="flex items-center px-3 py-2 text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
              >
                <CogIcon className="h-5 w-5 text-gray-400 mr-3" />
                Account Settings
              </Link>
            </nav>
          </div>
          
          <div className="bg-indigo-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-indigo-900 mb-2">Need Help?</h3>
            <p className="text-sm text-indigo-700 mb-3">
              Our support team is ready to assist you with any questions.
            </p>
            <Link 
              href="/support" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Contact Support →
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* In Progress Courses */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">In Progress</h2>
              <Link 
                href="/courses" 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Browse more courses
              </Link>
            </div>
            
            <div className="space-y-4">
              {inProgressCourses.map((course) => (
                <div key={course.id} className="bg-white shadow-md rounded-xl border border-[#e5e5e5] overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/4 relative h-32 md:h-auto rounded-lg overflow-hidden">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="md:w-3/4">
                        <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-3">{course.title}</h3>
                        <div className="flex items-center text-sm text-[#86868b] mb-4">
                          <span className="flex items-center mr-4">
                            <UserCircleIcon className="h-4 w-4 mr-1" />
                            {course.instructor}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {course.lastActivity}
                          </span>
                        </div>
                        <div className="mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-[#86868b]">Progress</span>
                            <span className="font-medium text-[#1d1d1f]">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-[#f5f5f7] rounded-full h-2.5">
                            <div 
                              className="bg-[#0066cc] h-2.5 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Link 
                            href={`/courses/${course.id}`} 
                            className="bg-[#0066cc] text-white text-sm font-medium px-5 py-2.5 rounded-full"
                          >
                            Continue Learning
                          </Link>
                          <Link 
                            href={`/courses/${course.id}/resources`} 
                            className="bg-white text-[#0066cc] border border-[#0066cc] text-sm font-medium px-5 py-2.5 rounded-full"
                          >
                            Resources
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    {course.nextLesson && (
                      <div className="mt-5 pt-4 border-t border-[#f5f5f7]">
                        <p className="text-sm text-[#86868b] mb-1">Next lesson:</p>
                        <Link 
                          href={`/courses/${course.id}/lessons/${course.nextLesson.id}`}
                          className="text-[#0066cc] hover:underline font-medium"
                        >
                          {course.nextLesson.title} ({course.nextLesson.duration})
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Completed Courses */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Completed Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {completedCourses.map((course) => (
                <div key={course.id} className="bg-white shadow-md rounded-xl border border-[#e5e5e5] overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-semibold text-[#1d1d1f] mb-1">{course.title}</h3>
                        <div className="flex items-center text-sm text-[#86868b] mb-2">
                          <span className="flex items-center">
                            <UserCircleIcon className="h-4 w-4 mr-1" />
                            {course.instructor}
                          </span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600 font-medium">Completed on {course.completedDate}</span>
                        </div>
                        {course.certificateUrl && (
                          <Link 
                            href={course.certificateUrl}
                            className="mt-2 inline-block text-sm text-[#0066cc] hover:underline font-medium"
                          >
                            View Certificate
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Learning Stats */}
          <section>
            <h2 className="text-xl font-bold mb-4">Your Learning Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white shadow-md rounded-xl border border-[#e5e5e5] p-5">
                <div className="text-3xl font-bold text-[#0066cc]">25</div>
                <div className="text-[#86868b]">Hours Spent Learning</div>
              </div>
              <div className="bg-white shadow-md rounded-xl border border-[#e5e5e5] p-5">
                <div className="text-3xl font-bold text-[#0066cc]">67</div>
                <div className="text-[#86868b]">Lessons Completed</div>
              </div>
              <div className="bg-white shadow-md rounded-xl border border-[#e5e5e5] p-5">
                <div className="text-3xl font-bold text-[#0066cc]">2</div>
                <div className="text-[#86868b]">Certificates Earned</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Mock data for dashboard
const inProgressCourses = [
  {
    id: 'react-masterclass',
    title: 'React Masterclass',
    instructor: 'Michael Johnson',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    progress: 65,
    lastActivity: '2 days ago',
    nextLesson: {
      id: 'redux-fundamentals',
      title: 'Redux Fundamentals',
      duration: '50:00'
    }
  },
  {
    id: 'node-backend',
    title: 'Node.js Backend Development',
    instructor: 'Sarah Wilson',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop',
    progress: 30,
    lastActivity: '1 week ago',
    nextLesson: {
      id: 'middleware',
      title: 'Middleware in Express',
      duration: '35:00'
    }
  }
];

const completedCourses = [
  {
    id: 'html-css-fundamentals',
    title: 'HTML & CSS Fundamentals',
    instructor: 'Jennifer Lee',
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
    completedDate: 'March 15, 2023',
    certificateUrl: '/certificates/html-css-fundamentals'
  },
  {
    id: 'javascript-basics',
    title: 'JavaScript Basics',
    instructor: 'David Kim',
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=2070&auto=format&fit=crop',
    completedDate: 'January 20, 2023',
    certificateUrl: '/certificates/javascript-basics'
  }
]; 