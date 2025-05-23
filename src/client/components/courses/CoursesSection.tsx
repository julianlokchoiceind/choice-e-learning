'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCoursesQuery } from '@/client/hooks/courses';
import { useTopicsQuery } from '@/client/hooks/topics';
import Link from 'next/link';
import Image from 'next/image';
import { TopicsFilter } from '@/client/components/topics';
import { Course } from '@/shared/types/courses/course';
import { LoadingState } from '@/client/components/common';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  AcademicCapIcon,
  ClockIcon,
  StarIcon,
  UserIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

// Define pagination interface
interface Pagination {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export default function CoursesSection() {
  // Get hooks from useCoursesQuery and useTopicsQuery
  const { useGetCourses } = useCoursesQuery();
  const { useGetTopics } = useTopicsQuery();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  // Available levels (hardcoded for now, could be fetched from API)
  const levels = ['beginner', 'intermediate', 'advanced'];
  
  // Create filter parameters
  const coursesFilter = useMemo(() => ({
    search: searchQuery || undefined,
    level: selectedLevel === '' ? undefined : selectedLevel.toLowerCase(),
    topics: selectedTopics.length > 0 ? selectedTopics : undefined,
    page: currentPage,
    limit: 9,
    sortBy: 'createdAt',
    order: 'desc' as const
  }), [searchQuery, selectedLevel, selectedTopics, currentPage]);
  
  // Use React Query to fetch courses - passing filter parameters
  const { 
    data: courses = [], 
    isLoading, 
    refetch: refetchCourses
  } = useGetCourses(coursesFilter);
  
  // Use React Query to fetch topics
  const { data: topicsData } = useGetTopics();
  
  // Extract topics
  const topics = Array.isArray(topicsData) ? topicsData.map(t => t.name) : [];
  
  // Update pagination state whenever courses change
  useEffect(() => {
    // If we have API response with pagination info, we would update it here
    // For now, we'll use a simple calculation based on the array length
    setPagination({
      page: currentPage,
      totalPages: Math.ceil(courses.length / 9),
      totalItems: courses.length
    });
  }, [courses, currentPage]);

  // For debugging topics filter
  useEffect(() => {
    console.log('Selected topics updated:', selectedTopics);
  }, [selectedTopics]);

  // React Query will automatically refetch when coursesFilter changes
  // No need for manual refetch calls
  
  const handleSearch = () => {
    setCurrentPage(1);
    // No manual refetch needed - React Query handles it
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
    // No manual refetch needed - React Query handles it
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // No manual refetch needed - React Query handles it
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedTopics([]);
    setCurrentPage(1);
    // No manual refetch needed - React Query handles it
  };

  // Use courses directly from API (already filtered)
  const filteredCourses = courses || [];

  // Placeholder image for courses without an image
  const placeholderImage = '/images/courses/course-placeholder.jpg';

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Filters section */}
      <div className='bg-white p-4 rounded-lg mb-8 shadow-sm'>
        <div className='grid md:grid-cols-4 gap-4'>
          {/* Search input */}
          <div>
            <label htmlFor='search' className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                id='search'
                placeholder='Search courses...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-10 px-3 py-2 border border-gray-300 rounded-md input-focus text-gray-900'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
          
          {/* Level filter */}
          <div>
            <label htmlFor='level' className='block text-sm font-medium text-gray-700 mb-1'>
              Level
            </label>
            <select
              id='level'
              value={selectedLevel}
              onChange={(e) => handleLevelChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md input-focus text-gray-900'
            >
              <option value=''>All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Topics filter component */}
          <div className='md:col-span-2'>
            <TopicsFilter 
              selectedTopics={selectedTopics}
              onChange={setSelectedTopics}
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className='mt-4 flex justify-between'>
          <button
            onClick={handleSearch}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md input-focus'
          >
            Search
          </button>
          
          <button
            onClick={clearFilters}
            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400'
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className='flex justify-center items-center h-64'>
          <LoadingState variant="section" message="Loading courses..." />
        </div>
      )}
      
      {/* No courses found */}
      {!isLoading && (!filteredCourses || filteredCourses.length === 0) && (
        <div className='bg-yellow-50 text-yellow-700 p-8 rounded-lg text-center'>
          <h3 className='text-xl font-bold mb-2'>No courses found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
      
      {/* Course grid */}
      {!isLoading && filteredCourses && filteredCourses.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCourses.map((course) => (
            <div key={course.id} className='border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow'>
              <div className='relative h-48'>
                <Image
                  src={course.imageUrl || placeholderImage}
                  alt={course.title}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  unoptimized={true} // Disable Next.js image optimization to avoid caching
                  loading='eager' // Load image immediately
                  key={`${course.id}-${course.imageUrl || 'placeholder'}`} // Force re-render when URL changes
                />
              </div>
              <div className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-xl font-bold'>{course.title}</h3>
                  <span className='bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded'>
                    {course.level && typeof course.level === 'string' ? 
                      course.level.charAt(0).toUpperCase() + course.level.slice(1) : 
                      'All Levels'}
                  </span>
                </div>
                <p className='text-gray-600 mb-4 line-clamp-2'>{course.description}</p>
                
                <div className='flex flex-wrap gap-1 mb-4'>
                  {Array.isArray(course.topics) && course.topics
                    .filter((topic: string) => topic !== 'featured') // Loại bỏ topic 'featured' khỏi hiển thị
                    .slice(0, 3).map((topic: string) => (
                    <span 
                      key={topic} 
                      className='bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-100'
                      onClick={() => {
                        if (!selectedTopics.includes(topic)) {
                          setSelectedTopics([...selectedTopics, topic]);
                        }
                      }}
                    >
                      {topic}
                    </span>
                  ))}
                  {Array.isArray(course.topics) && course.topics.filter((topic: string) => topic !== 'featured').length > 3 && (
                    <span className='bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded'>
                      +{course.topics.filter((topic: string) => topic !== 'featured').length - 3} more
                    </span>
                  )}
                </div>
                
                <div className='flex justify-between items-center mt-4'>
                  <span className='text-lg font-bold'>${course.price.toFixed(2)}</span>
                  <Link href={`/courses/${course.id}`} className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md'>
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-center mt-10'>
          <nav className='flex items-center space-x-2'>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            
            <button
              onClick={() =>
                handlePageChange(Math.min(pagination.totalPages, currentPage + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
