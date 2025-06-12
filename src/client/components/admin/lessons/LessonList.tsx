'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Lesson } from '@/shared/types/lessons/lesson';
import { useLessonsQuery } from '@/client/hooks/lessons';
import { useCoursesQuery } from '@/client/hooks/courses';
import { LoadingState } from '@/client/components/common';

// Define the type for course item
interface Course {
  id: string;
  title: string;
}

// Define the type for response data
interface LessonsResponse {
  data: Lesson[];
  meta?: {
    page: number;
    totalPages: number;
  };
}

export const LessonList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Sử dụng React Query thay vì quản lý state thủ công
  const { useGetLessons, useDeleteLesson } = useLessonsQuery();
  const { useGetCourses } = useCoursesQuery(true);
  
  // Lấy dữ liệu khóa học từ React Query
  const { 
    data: coursesData, 
    isLoading: coursesLoading 
  } = useGetCourses();
  
  // Lấy dữ liệu bài học từ React Query
  const { 
    data: lessonsData, 
    isLoading: lessonsLoading, 
    error: lessonsError 
  } = useGetLessons(selectedCourse || undefined);
  
  // Sử dụng mutation từ React Query cho xóa bài học
  const deleteLessonMutation = useDeleteLesson();

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }
    
    try {
      await deleteLessonMutation.mutateAsync({ id: lessonId, courseId: selectedCourse });
    } catch (err: unknown) {
      console.error('Error deleting lesson:', err);
      alert((err instanceof Error) ? err.message : 'Failed to delete lesson');
    }
  };

  // Giả định lessonsData có cấu trúc như LessonsResponse
  const responseLessons = lessonsData as unknown as LessonsResponse | undefined;
  
  // Lấy dữ liệu từ React Query hook
  const lessons = responseLessons?.data || [];
  const totalPages = responseLessons?.meta?.totalPages || 1;
  const courses = (coursesData?.data || []) as Course[];
  const isLoading = lessonsLoading || coursesLoading;
  const error = lessonsError;

  // Mock data for demonstration
  const mockLessons = [
    {
      id: '5071f77bcf86cd799439011',
      title: 'Introduction to React Components',
      courseId: 'react-fundamentals',
      courseName: 'React Fundamentals',
      chapterName: 'Chapter 1',
      order: 1,
      duration: 15,
      status: 'Published',
      createdAt: new Date().toISOString()
    },
    {
      id: '5071f77bcf86cd799439012',
      title: 'Understanding Props and State',
      courseId: 'react-fundamentals',
      courseName: 'React Fundamentals',
      chapterName: 'Chapter 1',
      order: 2,
      duration: 18,
      status: 'Draft',
      createdAt: new Date().toISOString()
    },
    {
      id: '5071f77bcf86cd799439013',
      title: 'Event Handling in React',
      courseId: 'react-fundamentals',
      courseName: 'React Fundamentals',
      chapterName: 'Chapter 2',
      order: 1,
      duration: 22,
      status: 'Published',
      createdAt: new Date().toISOString()
    },
    {
      id: '5071f77bcf86cd799439014',
      title: 'Working with Forms',
      courseId: 'react-fundamentals',
      courseName: 'React Fundamentals',
      chapterName: 'Chapter 2',
      order: 2,
      duration: 25,
      status: 'Draft',
      createdAt: new Date().toISOString()
    }
  ];

  const displayLessons = mockLessons;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Lessons Management</h1>
        </div>
        <Link href="/admin/lessons/new" className="btn-admin-primary">
          <PlusIcon className="h-5 w-5 mr-1" />
          Add New Lesson
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm"
            />
          </div>

          {/* Course Filter */}
          <div className="relative">
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
              disabled={coursesLoading}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Sort Order */}
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[var(--color-primary)] text-sm cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState variant="section" message="Loading lessons..." />
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load lessons</h3>
          <p className="text-gray-500">Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      ) : displayLessons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PlayCircleIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lessons found</h3>
          <p className="text-gray-500 mb-6">
            {selectedCourse 
              ? 'Try selecting a different course or create a new lesson for this course'
              : 'Get started by creating your first lesson'}
          </p>
          <Link href="/admin/lessons/new" className="btn-admin-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Lesson
          </Link>
        </div>
      ) : (
        <>
          {/* Lessons Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    #
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Lesson Title
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-sm font-medium text-[var(--color-primary-dark)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayLessons.map((lesson, index) => (
                  <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <PlayCircleIcon className="h-8 w-8 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-xs text-gray-500">ID: {lesson.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{lesson.courseName}</div>
                      <div className="text-xs text-gray-500">{lesson.chapterName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lesson.order}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lesson.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        lesson.status === 'Published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lesson.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-3">
                        <Link
                          href={`/admin/lessons/${lesson.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          disabled={deleteLessonMutation.isPending}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{displayLessons.length}</span> lessons
              </p>
              <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonList;