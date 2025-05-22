'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useCoursesQuery } from '@/client/hooks/courses';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import { CourseImage } from '@/client/components/courses';

// Helper functions
const formatCourseTitle = (title: string): string => {
  if (!title) return '';
  return title.length > 40 ? `${title.substring(0, 40)}...` : title;
};

const formatLevel = (level: string): string => {
  if (!level) return 'All Levels';
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatStatus = (status: string, isPublished: boolean): string => {
  if (isPublished === false) return 'Draft';
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Published';
};

const getLevelBadgeClass = (level: string): string => {
  switch (level?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadgeClass = (status: string, isPublished: boolean): string => {
  if (isPublished === false) return 'bg-gray-100 text-gray-800';
  
  switch (status?.toLowerCase()) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'private':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSortParams = (sortOption: string): { sortBy: string; sortOrder: 'asc' | 'desc' } => {
  switch (sortOption) {
    case 'title-asc':
      return { sortBy: 'title', sortOrder: 'asc' };
    case 'title-desc':
      return { sortBy: 'title', sortOrder: 'desc' };
    case 'price-asc':
      return { sortBy: 'price', sortOrder: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortOrder: 'desc' };
    case 'students':
      return { sortBy: 'students', sortOrder: 'desc' };
    case 'oldest':
      return { sortBy: 'createdAt', sortOrder: 'asc' };
    case 'newest':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
};

export default function CoursesPage() {
  // Use the useCoursesQuery hook with isAdmin=true
  const coursesQuery = useCoursesQuery(true);
  const { useGetCourses, useDeleteCourse } = coursesQuery;
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Create filter object from state
  const courseFilter = useMemo(() => ({
    search: searchQuery || undefined,
    level: selectedLevel === 'all' ? undefined : selectedLevel,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    page: currentPage,
    limit: 10,
    ...getSortParams(sortOption)
  }), [searchQuery, selectedLevel, selectedStatus, currentPage, sortOption]);
  
  // Use React Query for fetching courses
  const { 
    data,
    isLoading,
    error: queryError,
    refetch
  } = useGetCourses(courseFilter);
  
  // Extract courses and pagination from response
  const courses = Array.isArray(data) ? data : (data as any)?.data || [];
  const pagination = {
    page: currentPage,
    pageSize: 10,
    totalItems: Array.isArray(data) ? data.length : ((data as any)?.meta?.totalItems || 0),
    totalPages: Array.isArray(data) ? 1 : ((data as any)?.meta?.totalPages || 1),
  };
  
  // Use React Query for delete mutation
  const deleteCourse = useDeleteCourse();
  
  // Format error message
  const error = queryError ? 
    (queryError instanceof Error ? queryError.message : 'Failed to fetch courses') : 
    null;
  
  // Add CSS for buttons with no transform on hover
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
  
  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async (courseId: string) => {
    try {
      await deleteCourse.mutateAsync(courseId);
      setConfirmDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting course:', error);
      // Error is handled by the mutation
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>Courses Management</h1>
        </div>
        <Link
          href='/admin/courses/new'
          className='px-4 py-2 rounded-md flex items-center admin-button add-course-btn'
        >
          <PlusIcon className='h-5 w-5 mr-1' />
          Add New Course
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center'>
          <div className='flex flex-wrap gap-4 items-center'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input 
                type='text' 
                placeholder='Search courses...' 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            
            <select 
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='all'>All Levels</option>
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
            
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='all'>All Status</option>
              <option value='published'>Published</option>
              <option value='draft'>Draft</option>
            </select>
            
            <button
              onClick={handleSearch}
              className='py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md admin-button'
            >
              Filter
            </button>
          </div>
          
          <div>
            <select 
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none sm:text-sm'
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='title-asc'>Title (A-Z)</option>
              <option value='title-desc'>Title (Z-A)</option>
              <option value='price-asc'>Price (Low to High)</option>
              <option value='price-desc'>Price (High to Low)</option>
              <option value='students'>Most Students</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 mx-4 mt-4'>
            {error}
          </div>
        )}

        {/* Courses list */}
        <div className='overflow-x-auto'>
          {isLoading || deleteCourse.isPending ? (
            <div className='py-10 text-center'>
              <LoadingState variant="table" message={deleteCourse.isPending ? 'Deleting course...' : 'Loading courses...'} />
            </div>
          ) : courses.length === 0 ? (
            <div className='py-10 text-center'>
              <p className='text-gray-500'>No courses found.</p>
              <p className='text-sm mt-1'>Create a new course or try with a different search term.</p>
            </div>
          ) : (
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    #
                  </th>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Course Title
                  </th>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Level
                  </th>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Students
                  </th>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Price
                  </th>
                  <th scope='col' className='py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Status
                  </th>
                  <th scope='col' className='py-4 px-6 text-right font-medium text-indigo-700 capitalize tracking-wider text-base'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {courses.map((course, index) => (
                  <tr key={course.id} className='hover:bg-gray-50 transition-colors duration-150'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 overflow-hidden'>
                          <CourseImage course={course} />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{formatCourseTitle(course.title)}</div>
                          <div className='text-sm text-gray-500'>ID: {course.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeClass(course.level)}`}>
                        {formatLevel(course.level)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {course.students || course.studentsCount || 0}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      ${course.price.toFixed(2)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(course.status, course.isPublished)}`}>
                        {formatStatus(course.status, course.isPublished)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex space-x-2 justify-end'>
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className='text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 rounded-md p-1.5 transition-colors duration-150 admin-button'
                          aria-label='Edit course'
                        >
                          <PencilSquareIcon className='h-5 w-5' />
                        </Link>
                        
                        {confirmDelete === course.id.toString() ? (
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => handleDeleteConfirm(course.id.toString())}
                              className='text-red-600 hover:text-red-800 font-medium bg-red-50 px-2 py-1 rounded admin-button'
                              disabled={deleteCourse.isPending}
                            >
                              {deleteCourse.isPending ? 'Deleting...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                              disabled={deleteCourse.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) :
                          <button 
                            onClick={() => setConfirmDelete(course.id.toString())}
                            className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                            aria-label='Delete course'
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {/* Pagination - only show if we have courses */}
          {!isLoading && courses.length > 0 && pagination && pagination.totalPages > 0 && (
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Showing {courses.length} of {pagination.totalItems || courses.length} courses
              </div>
              <div className='flex space-x-1'>
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
                >
                  <ChevronLeftIcon className='h-5 w-5' />
                </button>
                
                {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === page 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } admin-button`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className={`p-2 ${currentPage === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
                >
                  <ChevronRightIcon className='h-5 w-5' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}