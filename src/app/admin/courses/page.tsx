'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useCourses } from '@/client/hooks/courses';
import { Course } from '@/shared/types/courses/course';

// Define valid level options to ensure consistency with the backend
const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export default function CoursesPage() {
  // Use the useCourses hook with isAdmin=true
  const {
    loading: isLoading,
    courses,
    deleteCourse,
    fetchCourses,
    pagination
  } = useCourses(true);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize state with default values
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // Handle delete confirmation
  const handleDeleteConfirm = async (courseId: string) => {
    try {
      // Hide confirmation buttons first
      setConfirmDelete(null);
      
      // Show loading state
      setIsDeleting(true);
      
      // Use the deleteCourse function from the hook
      await deleteCourse(courseId);
      
      // Refresh the courses list
      fetchCourses({
        search: debouncedSearchQuery || undefined,
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        page: pagination.page,
        limit: pagination.pageSize,
        ...getSortParams(sortOption)
      });
      
    } catch (error) {
      console.error('Error deleting course:', error);
      // Silent error handling, no UI feedback
    } finally {
      setConfirmDelete(null);
      setIsDeleting(false);
    }
  };
  
  // Add basic styles for consistent appearance
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
  
  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Convert sort option to API parameters
  const getSortParams = (option: string): { sortBy: string, sortOrder: 'asc' | 'desc' } => {
    switch (option) {
      case 'newest':
        return { sortBy: 'createdAt', sortOrder: 'desc' };
      case 'oldest':
        return { sortBy: 'createdAt', sortOrder: 'asc' };
      case 'priceAsc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'priceDesc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'title':
        return { sortBy: 'title', sortOrder: 'asc' };
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  // Fetch courses when filters change
  useEffect(() => {
    try {
      console.log('[CoursesPage] Fetching courses with filters:', {
        search: debouncedSearchQuery,
        level: selectedLevel,
        sortOption
      });
      
      fetchCourses({
        search: debouncedSearchQuery || undefined,
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        page: 1,
        limit: 10,
        ...getSortParams(sortOption)
      }).catch(err => {
        console.error('[CoursesPage] Error in effect when fetching courses:', err);
        // Error is already handled in the hook, so we don't need to do anything here
      });
    } catch (error) {
      console.error('[CoursesPage] Exception in courses fetch effect:', error);
      // Continue rendering with empty data
    }
  }, [debouncedSearchQuery, selectedLevel, sortOption, fetchCourses]);

  // Get CSS class for level badge - using case-insensitive matching
  const getLevelBadgeClass = (level: string) => {
    // Handle null/undefined case
    if (!level) return 'bg-purple-100 text-purple-800';
    
    // Normalize to lowercase for consistent matching
    const normalizedLevel = level.toLowerCase();
    
    // Match against known values
    switch(normalizedLevel) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'all':
        return 'bg-purple-100 text-purple-800';
      default:
        // Log unknown levels for debugging
        console.log(`Unknown level value encountered: ${level}`);
        return 'bg-purple-100 text-purple-800';
    }
  };
  
  // Format level for display
  const formatLevel = (level: string): string => {
    if (!level) return 'Unknown';
    
    // Normalize to lowercase first
    const normalizedLevel = level.toLowerCase();
    
    // Map to display value
    switch (normalizedLevel) {
      case 'beginner':
        return 'Beginner';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'all':
        return 'All Levels';
      default:
        // Default fallback with capitalization
        return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <BookOpenIcon className='h-7 w-7 text-indigo-600 mr-3' />
          <h1 className='text-2xl font-bold text-gray-800'>Course Management</h1>
        </div>
        <Link 
          href='/admin/courses/new' 
          className='px-4 py-2 rounded-md flex items-center admin-button add-course-btn'
        >
          <PlusIcon className='h-5 w-5 mr-1' />
          Add New Course
        </Link>
      </div>

      <div className='bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden'>
        <div className='p-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4'>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
            </div>
            <input 
              type='text' 
              placeholder='Search courses...' 
              className='py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-2'>
            {/* Level dropdown - using predefined options */}
            <select 
              id='level-filter'
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm'
              value={selectedLevel}
              onChange={(e) => {
                // Lấy giá trị và gọi thông báo debug
                let newLevel = e.target.value.trim();
                console.log(`Level dropdown changed to: '${newLevel}'`);
                
                // Bảo vệ trường hợp giá trị rỗng
                if (!newLevel) {
                  newLevel = 'all';
                  console.log('Empty level value, defaulting to all');
                }
                
                // Chuẩn hóa lowercase
                newLevel = newLevel.toLowerCase();
                console.log(`Normalized level: '${newLevel}'`);
                
                // Kiểm tra giá trị hợp lệ
                if (!['all', 'beginner', 'intermediate', 'advanced'].includes(newLevel)) {
                  console.error(`Invalid level value: '${newLevel}', resetting to 'all'`);
                  newLevel = 'all';
                }
                
                // Cập nhật state
                setSelectedLevel(newLevel);
              }}
            >
              {LEVEL_OPTIONS.map(option => (
                <option key={option.value} value={option.value.toLowerCase()}>
                  {option.label}
                </option>
              ))}
            </select>
            
            {/* Sort dropdown */}
            <select 
              id='sort-filter'
              className='py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm'
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
              }}
            >
              <option value='newest'>Sort By: Newest</option>
              <option value='oldest'>Sort By: Oldest</option>
              <option value='priceAsc'>Sort By: Price (Low-High)</option>
              <option value='priceDesc'>Sort By: Price (High-Low)</option>
              <option value='title'>Sort By: Title (A-Z)</option>
            </select>
          </div>
        </div>
        
        <div className='overflow-x-auto'>
          {isLoading || isDeleting ? (
            <div className='py-10 text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4'></div>
              <p className='text-gray-500'>{isDeleting ? 'Deleting course...' : 'Loading courses...'}</p>
            </div>
          ) : courses.length === 0 ? (
            <div className='py-10 text-center'>
              <p className='text-gray-500'>No any course now...</p>
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
                          <Image src={course.imageUrl || '/images/placeholder-course.jpg'} 
                            alt={course.title || 'Course image'}
                            className='h-full w-full object-cover'
                            width={500} height={300}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder-course.jpg';
                            }}
                          />
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>{course.title}</div>
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
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className='text-gray-600 hover:text-gray-800 bg-gray-50 px-2 py-1 rounded admin-button'
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmDelete(course.id.toString())}
                            className='text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md p-1.5 transition-colors duration-150 admin-button'
                            aria-label='Delete course'
                          >
                            <TrashIcon className='h-5 w-5' />
                          </button>
                        )}
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
                  onClick={() => {
                    try {
                      fetchCourses({
                        search: debouncedSearchQuery || undefined,
                        level: selectedLevel === 'all' ? undefined : selectedLevel,
                        page: Math.max(1, pagination.page - 1),
                        limit: pagination.pageSize,
                        ...getSortParams(sortOption)
                      }).catch(err => {
                        console.error('[CoursesPage] Error when fetching previous page:', err);
                        // Error is already handled in the hook
                      });
                    } catch (error) {
                      console.error('[CoursesPage] Exception in prev page handler:', error);
                    }
                  }}
                  disabled={pagination.page === 1}
                  className={`p-2 ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
                >
                  <ChevronLeftIcon className='h-5 w-5' />
                </button>
                
                {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => {
                      try {
                        fetchCourses({
                          search: debouncedSearchQuery || undefined,
                          level: selectedLevel === 'all' ? undefined : selectedLevel,
                          page: page,
                          limit: pagination.pageSize,
                          ...getSortParams(sortOption)
                        }).catch(err => {
                          console.error(`[CoursesPage] Error when fetching page ${page}:`, err);
                          // Error is already handled in the hook
                        });
                      } catch (error) {
                        console.error(`[CoursesPage] Exception in page ${page} handler:`, error);
                      }
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      pagination.page === page 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } admin-button`}
                  >
                    {page}
                  </button>
                ))}
                
                <button 
                  onClick={() => {
                    try {
                      fetchCourses({
                        search: debouncedSearchQuery || undefined,
                        level: selectedLevel === 'all' ? undefined : selectedLevel,
                        page: Math.min(pagination.totalPages, pagination.page + 1),
                        limit: pagination.pageSize,
                        ...getSortParams(sortOption)
                      }).catch(err => {
                        console.error('[CoursesPage] Error when fetching next page:', err);
                        // Error is already handled in the hook
                      });
                    } catch (error) {
                      console.error('[CoursesPage] Exception in next page handler:', error);
                    }
                  }}
                  disabled={pagination.page === pagination.totalPages}
                  className={`p-2 ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 rounded'} admin-button`}
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