'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CoursesError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Courses page error:', error);
  }, [error]);

  // Check if this is a "Failed to fetch courses" error
  const isNoCoursesError = error.message.includes('Failed to fetch courses');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-red-600">
          {isNoCoursesError ? 'No Courses Available' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-700 mb-6">
          {isNoCoursesError 
            ? 'There are currently no courses in the database. You need to add courses before they can be displayed.'
            : 'We encountered an error while trying to load the courses. Please try again later.'}
        </p>
        
        {isNoCoursesError ? (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
            <h3 className="font-bold text-lg mb-2">How to Add Courses:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <span className="font-medium">Using the Admin UI:</span>{' '}
                <Link href="/admin/courses" className="text-blue-600 hover:underline">
                  Go to the admin courses page
                </Link>{' '}
                and click "Add New Course"
              </li>
              <li>
                <span className="font-medium">Using the Seed Script:</span> Run{' '}
                <code className="bg-gray-100 px-2 py-1 rounded">npm run seed-courses</code>{' '}
                in your terminal to add sample courses automatically
              </li>
            </ol>
            <p className="mt-2 text-sm">
              For detailed instructions, please refer to the{' '}
              <Link href="/README-ADDING-COURSES.md" className="text-blue-600 hover:underline">
                Adding Courses documentation
              </Link>
            </p>
          </div>
        ) : null}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 text-center"
          >
            Return to home
          </Link>
          
          {isNoCoursesError && (
            <Link
              href="/admin/courses/add"
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 text-center"
            >
              Add a Course
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 