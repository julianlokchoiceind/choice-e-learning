"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon, PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  topics: string[];
  studentCount: number;
  videoUrl?: string;
  imageUrl?: string;
}

export default function AdminCoursesIndex() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/admin/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setCourses(data.courses);
        } else {
          throw new Error(data.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      setCourses(courses.filter(course => course.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };
  
  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        </div>
        <Link
          href="/admin/courses/add"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Add New Course
        </Link>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Total Courses</p>
              <h3 className="text-white text-2xl font-bold mt-1">{courses.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Active Students</p>
              <h3 className="text-white text-2xl font-bold mt-1">{courses.reduce((sum, course) => sum + course.studentCount, 0)}</h3>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-md p-5 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white text-sm font-medium">Revenue</p>
              <h3 className="text-white text-2xl font-bold mt-1">
                ${courses.reduce((sum, course) => sum + (course.price * course.studentCount), 0).toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Instructions for adding courses */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg shadow-sm">
        <h2 className="text-lg font-bold mb-3 text-gray-800">Adding Courses</h2>
        <p className="mb-4 text-gray-700">
          There are two ways to add courses to the system:
        </p>
        <ol className="list-decimal list-inside space-y-3 mb-4 text-gray-700">
          <li className="pl-2">
            <span className="font-medium text-gray-800">Using the Admin UI:</span> Click the "Add New Course" button above to fill out a form and add a course directly.
          </li>
          <li className="pl-2">
            <span className="font-medium text-gray-800">Using the Seed Script:</span> Run <code className="bg-gray-200 px-2 py-1 rounded text-indigo-600 font-mono text-sm">npm run seed-courses</code> in your terminal to add sample courses automatically.
          </li>
        </ol>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-50 text-red-700 p-6 rounded-lg mb-8 shadow-sm border border-red-100">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {/* No courses state */}
      {!loading && !error && courses.length === 0 && (
        <div className="bg-yellow-50 p-8 rounded-lg text-center shadow-sm border border-yellow-100">
          <svg className="h-12 w-12 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold mb-2 text-gray-800">No courses found</h3>
          <p className="mb-6 text-gray-600">You haven't added any courses yet. Get started by adding your first course.</p>
          <Link
            href="/admin/courses/add"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block transition-colors duration-200 shadow-sm"
          >
            Add Your First Course
          </Link>
        </div>
      )}
      
      {/* Course list */}
      {!loading && !error && courses.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Title</th>
                  <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Level</th>
                  <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Price</th>
                  <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Students</th>
                  <th className="py-4 px-6 text-left font-medium text-indigo-700 uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{course.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs mt-1">{course.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      {course.level === 'beginner' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                          {course.level}
                        </span>
                      )}
                      {course.level === 'intermediate' && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium capitalize">
                          {course.level}
                        </span>
                      )}
                      {course.level === 'advanced' && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium capitalize">
                          {course.level}
                        </span>
                      )}
                      {!['beginner', 'intermediate', 'advanced'].includes(course.level) && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                          {course.level}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800">${course.price.toFixed(2)}</td>
                    <td className="py-4 px-6 text-gray-700">{course.studentCount}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <Link
                          href={`/courses/${course.id}`}
                          className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-150"
                          aria-label="View course"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-150"
                          aria-label="Edit course"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-150"
                          aria-label="Delete course"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {courses.length} {courses.length === 1 ? 'course' : 'courses'}
            </div>
            <div className="flex space-x-1">
              <button disabled className="p-2 text-gray-400 cursor-not-allowed">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center shadow-sm">
                1
              </button>
              <button disabled className="p-2 text-gray-400 cursor-not-allowed">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 