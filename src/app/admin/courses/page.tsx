"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

// Define the Course type to match API response
interface Course {
  id: string | number;
  title: string;
  description?: string;
  price: number;
  level: string;
  topics?: string[];
  imageUrl?: string;
  students?: number;
  studentsCount?: number; // API response field
  lessonsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Delete course function
  const deleteCourse = async (courseId: string) => {
    setIsDeleting(courseId);
    
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      // Remove course from state
      setCourses(prevCourses => prevCourses.filter(course => course.id.toString() !== courseId));
      
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };
  
  // Add CSS for buttons with no transform on hover - matching sidebar behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .admin-button {
        transform: none !important;
      }
      .admin-button:hover {
        transform: none !important;
        box-shadow: none !important;
      }
      
      /* Styling for Add Course button */
      .add-course-btn {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        color: white !important;
        transition: none !important;
      }
      
      .add-course-btn:hover {
        background-image: linear-gradient(to right, #3b82f6, #1d4ed8) !important;
        box-shadow: 0 0 0 2000px rgba(59, 130, 246, 0.2) inset !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Fetch courses from the API when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/admin/courses');
        
        if (!response.ok) {
          console.error(`Failed to fetch courses: ${response.status} ${response.statusText}`);
          setCourses([]);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          console.error('Invalid API response:', data);
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const getLevelBadgeClass = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
        <Link 
          href="/admin/courses/new" 
          className="px-4 py-2 rounded-md flex items-center admin-button add-course-btn"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Course
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="py-2 pl-10 pr-4 block w-full sm:w-80 shadow-sm border border-gray-300 rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <select className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm">
              <option>Sort By: Newest</option>
              <option>Sort By: Price (Low-High)</option>
              <option>Sort By: Price (High-Low)</option>
              <option>Sort By: Most Students</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">No any course now...</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                    Course Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 overflow-hidden">
                          {course.imageUrl && (
                            <img 
                              src={course.imageUrl} 
                              alt={course.title}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/placeholder-course.jpg';
                              }}
                            />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500">ID: {course.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeClass(course.level)}`}>
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {course.students || course.studentsCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${course.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <Link
                          href={`/admin/courses/edit/${course.id}`}
                          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button"
                          aria-label="Edit course"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button"
                          aria-label="Delete course"
                          disabled={isDeleting === course.id.toString()}
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${course.title}"?`)) {
                              deleteCourse(course.id.toString());
                            }
                          }}
                        >
                          {isDeleting === course.id.toString() ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <TrashIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Pagination - only show if we have courses */}
          {!isLoading && courses.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing 1 to {courses.length} of {courses.length} courses
              </div>
              <div className="flex space-x-1">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-md admin-button">
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button className="w-8 h-8 bg-[var(--color-primary)] text-white rounded-md flex items-center justify-center font-medium admin-button">
                  1
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-md admin-button">
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}