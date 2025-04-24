"use client";

import { useState, useEffect, useCallback } from 'react';
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

// Define valid level options to ensure consistency with the backend
const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

// Ensure all level values are lowercase for consistent request parameters

export default function CoursesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Initialize state with default values (ensuring lowercase for level)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' is already lowercase
  const [sortOption, setSortOption] = useState('newest');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
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
      case 'mostStudents':
        return { sortBy: 'students', sortOrder: 'desc' };
      case 'leastStudents':
        return { sortBy: 'students', sortOrder: 'asc' };
      case 'title':
        return { sortBy: 'title', sortOrder: 'asc' };
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  // Fetch courses with filters and sorting
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    console.log('===== FETCHING COURSES =====');
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      // Thêm tham số search
      if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
        params.append('search', debouncedSearchQuery.trim());
        console.log(`Adding search parameter: "${debouncedSearchQuery.trim()}"`);
      }
      
      // Xử lý level parameter
      if (selectedLevel && selectedLevel !== 'all') {
        const normalizedLevel = selectedLevel.toLowerCase().trim();
        params.append('level', normalizedLevel);
        console.log(`Adding level filter: "${normalizedLevel}"`);
      } else {
        console.log('No level filter (showing all levels)');
      }
      
      // Thêm các tham số sắp xếp
      const { sortBy, sortOrder } = getSortParams(sortOption);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      console.log(`Adding sort parameters: ${sortBy} ${sortOrder}`);
      
      // Tạo timestamp để tránh cache
      const timestamp = Date.now();
      params.append('t', timestamp.toString());
      
      // Gọi API
      const url = `/api/admin/courses?${params.toString()}`;
      console.log(`Sending request to: ${url}`);
      
      const response = await fetch(url, {
        // Thêm headers để tránh cache
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        setCourses([]);
        return;
      }
      
      const data = await response.json();
      console.log(`API Response success: ${data.success}, courses count: ${data.courses?.length || 0}`);
      
      // Kiểm tra dữ liệu trả về
      if (data.success && Array.isArray(data.courses)) {
        const receivedCourses = data.courses;
        console.log(`Received ${receivedCourses.length} courses from API`);
        
        // Log level values để debug
        console.log('Course levels from API:', 
          receivedCourses.map((c: Course) => ({ title: c.title, level: c.level }))
        );
        
        // Cập nhật state
        setCourses(receivedCourses);
      } else {
        console.error('Invalid API response format:', data);
        setCourses([]);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    } finally {
      setIsLoading(false);
      console.log('===== END FETCHING COURSES =====');
    }
  }, [debouncedSearchQuery, selectedLevel, sortOption]);
  
  // Fetch courses whenever filters or sort options change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BookOpenIcon className="h-7 w-7 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
        </div>
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
              className="py-2 pl-10 pr-4 block w-full sm:w-80 border border-gray-300 rounded-md focus:ring-0 focus:border-[var(--color-primary)] outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* Level dropdown - using predefined options */}
            <select 
              id="level-filter"
              className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              value={selectedLevel}
              onChange={(e) => {
                // Lấy giá trị và gọi thông báo debug
                let newLevel = e.target.value.trim();
                console.log(`Level dropdown changed to: "${newLevel}"`);
                
                // Bảo vệ trường hợp giá trị rỗng
                if (!newLevel) {
                  newLevel = 'all';
                  console.log('Empty level value, defaulting to "all"');
                }
                
                // Chuẩn hóa lowercase
                newLevel = newLevel.toLowerCase();
                console.log(`Normalized level: "${newLevel}"`);
                
                // Kiểm tra giá trị hợp lệ
                if (!['all', 'beginner', 'intermediate', 'advanced'].includes(newLevel)) {
                  console.error(`Invalid level value: "${newLevel}", resetting to "all"`);
                  newLevel = 'all';
                }
                
                // Cập nhật state
                setSelectedLevel(newLevel);
                
                // Gọi API với giá trị mới
                setTimeout(() => {
                  console.log(`Fetching courses with new level: "${newLevel}"`);
                  fetchCourses();
                }, 0);
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
              id="sort-filter"
              className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                // Trigger immediate re-fetch with new sort option
                setTimeout(() => fetchCourses(), 0);
              }}
            >
              <option value="newest">Sort By: Newest</option>
              <option value="oldest">Sort By: Oldest</option>
              <option value="priceAsc">Sort By: Price (Low-High)</option>
              <option value="priceDesc">Sort By: Price (High-Low)</option>
              <option value="mostStudents">Sort By: Most Students</option>
              <option value="leastStudents">Sort By: Least Students</option>
              <option value="title">Sort By: Title (A-Z)</option>
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
                  <th scope="col" className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">
                    #
                  </th>
                  <th scope="col" className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">
                    Course Title
                  </th>
                  <th scope="col" className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">
                    Level
                  </th>
                  <th scope="col" className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">
                    Students
                  </th>
                  <th scope="col" className="py-4 px-6 text-left font-medium text-indigo-700 capitalize tracking-wider text-base">
                    Price
                  </th>
                  <th scope="col" className="py-4 px-6 text-right font-medium text-indigo-700 capitalize tracking-wider text-base">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
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
                        {formatLevel(course.level)}
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
                          href={`/admin/courses/${course.id}/edit`}
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