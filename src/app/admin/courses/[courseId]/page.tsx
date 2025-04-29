"use client";

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
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const apiClient = (await import('@/lib/axios/apiClient')).default;
        const response = await apiClient.get(`/api/courses/${courseId}`);
        const data = response.data;
        
        if (data.success && data.data) {
          setCourse(data.data);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
  
  const handleDeleteCourse = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      const apiClient = (await import('@/lib/axios/apiClient')).default;
      await apiClient.delete(`/api/admin/courses/${courseId}`);
      
      // Redirect to courses page after successful deletion
      router.push('/admin/courses');
      
    } catch (err) {
      console.error('Error deleting course:', err);
      alert(`Failed to delete course: ${(err as Error).message || 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500">Loading course data...</div>
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error || 'Course not found'}</p>
        <Link 
          href="/admin/courses" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to All Courses
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-2">{course.title}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {course.imageUrl && (
              <div className="h-48 overflow-hidden">
                <Image src={course.imageUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                  width={500} height={300} />
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 mb-6">{course.description}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {course.topics && course.topics.length > 0 ? (
                    course.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No topics listed</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/admin/courses/${courseId}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
                <button
                  onClick={handleDeleteCourse}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Course
                </button>
              </div>
            </div>
          </div>
          
          {/* Lessons Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Lessons</h2>
              <Link
                href={`/admin/courses/${courseId}/edit?tab=lessons`}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Manage Lessons
              </Link>
            </div>
            
            <div className="p-4">
              {/* This would be populated with actual lessons data */}
              <div className="text-center py-6 text-gray-500">
                To view and manage lessons, click on "Manage Lessons" above.
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${(course.price || 0).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <BookOpenIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium capitalize">{course.level}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <UserGroupIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Enrolled Students</p>
                  <p className="font-medium">{course.studentIds?.length || 0}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Created On</p>
                  <p className="font-medium">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
