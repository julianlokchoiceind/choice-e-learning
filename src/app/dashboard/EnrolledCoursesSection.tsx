import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EnrolledCourse {
  id: string;
  title: string;
  progress: number;
  imageUrl: string;
  totalLessons: number;
  completedLessons: number;
}

interface EnrolledCoursesSectionProps {
  courses: EnrolledCourse[];
}

export default function EnrolledCoursesSection({ courses: initialCourses }: EnrolledCoursesSectionProps) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [unenrollingCourseId, setUnenrollingCourseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUnenroll = async (courseId: string) => {
    if (!confirm('Are you sure you want to unenroll from this course? Your progress will be saved if you decide to re-enroll later.')) {
      return;
    }
    
    setUnenrollingCourseId(courseId);
    setError(null);
    
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the course from the local state
        setCourses(courses.filter(course => course.id !== courseId));
      } else {
        setError(data.error || 'Failed to unenroll from course');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUnenrollingCourseId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Courses</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
        {courses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {courses.map((course) => (
              <div key={course.id} className="p-4 transition hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start">
                  <div className="flex-shrink-0 w-full sm:w-32 h-24 mb-4 sm:mb-0 sm:mr-4">
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{course.title}</h3>
                    <div className="flex items-center mb-2 text-sm text-gray-500">
                      <span>{course.completedLessons} of {course.totalLessons} lessons completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-sm font-semibold text-indigo-600">{course.progress}% complete</span>
                      <div className="flex gap-2">
                        <Link
                          href={`/courses/${course.id}/learn`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Continue Learning
                        </Link>
                        <button
                          onClick={() => handleUnenroll(course.id)}
                          disabled={unenrollingCourseId === course.id}
                          className="text-sm font-medium text-red-600 hover:text-red-800"
                        >
                          {unenrollingCourseId === course.id ? 'Unenrolling...' : 'Unenroll'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't enrolled in any courses yet.</p>
            <div className="mt-6">
              <Link
                href="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 