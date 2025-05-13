import { useState, useCallback } from 'react';
import axios from 'axios';
import { Course, CourseListItem, CourseStatus } from '@/shared/types/courses/course';

/**
 * Ensures a course has the correct status value based on status field or isPublished
 * @param course Course object to process
 * @returns Course with normalized status
 */
function normalizeStatus(course: any) {
  // Skip if course is null or undefined
  if (!course) return course;
  
  // If the status is already a valid CourseStatus enum value, keep it as is
  if (course.status === CourseStatus.DRAFT || course.status === CourseStatus.PUBLISHED) {
    return course;
  }
  
  // If status is a string but not a CourseStatus enum, normalize it
  if (typeof course.status === 'string') {
    const status = course.status.toLowerCase();
    if (status === 'draft' || status === 'published') {
      // Convert to enum value
      return {
        ...course,
        status: status as CourseStatus
      };
    }
  }
  
  // If no valid status, fallback to isPublished
  return {
    ...course,
    status: course.isPublished ? CourseStatus.PUBLISHED : CourseStatus.DRAFT
  };
}

interface CourseFilter {
  search?: string;
  category?: string;
  topics?: string[]; // Thêm support cho nhiều topics
  level?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  _cache?: number; // Thêm cache-busting parameter
}

interface CourseResponseBasic {
  success: boolean;
  data: (Course | CourseListItem)[] | Course | CourseListItem;
  courses?: (Course | CourseListItem)[];
  meta?: {
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  };
}

function useCourses(isAdmin = false) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<(Course | CourseListItem)[]>([]);
  const [course, setCourse] = useState<Course | CourseListItem | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [levels] = useState(['beginner', 'intermediate', 'advanced']);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Base URL depending on if admin or public
  const baseUrl = isAdmin ? '/api/admin/courses' : '/api/courses';

  /**
   * Fetch courses with filtering and pagination
   */
  const fetchCourses = useCallback(async (filters: CourseFilter = {}): Promise<CourseResponseBasic> => {
    setLoading(true);
    setError(null);
    
    // Default empty response
    const emptyResponse: CourseResponseBasic = {
      success: true,
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      }
    };
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      
      // Only include level parameter if it's provided and not 'all'
      if (filters.level && filters.level !== 'all') {
        params.append('level', filters.level.toLowerCase());
        console.log('Using level filter:', filters.level.toLowerCase());
      }
      
      // Handle multiple topics if provided
      if (filters.topics && Array.isArray(filters.topics) && filters.topics.length > 0) {
        filters.topics.forEach(topic => {
          params.append('topics', topic);
        });
      }
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('order', filters.sortOrder);
      
      // Thêm try-catch chi tiết hơn khi gọi API
      let response;
      try {
        console.log(`[useCourses] Calling API: ${baseUrl}?${params.toString()}`);
        response = await axios.get(`${baseUrl}?${params.toString()}`);
        console.log('[useCourses] API Response:', response.data);
        
        // Log headers and status for debugging
        console.log('[useCourses] Response status:', response.status);
        console.log('[useCourses] Content type:', response.headers['content-type']);
        
        // Kiểm tra xem response có đúng định dạng không
        if (!response || !response.data) {
          console.error('[useCourses] Empty response from server');
          // Return empty default values instead of throwing
          return emptyResponse;
        }
      } catch (apiError: unknown) {
        // Log đầy đủ thông tin lỗi
        console.error('[useCourses] API call failed with error:', apiError);
        
        if (typeof apiError === 'object' && apiError !== null && 'response' in apiError) {
          const errorResponse = apiError.response;
          if (typeof errorResponse === 'object' && errorResponse !== null) {
            console.error('[useCourses] Response status:', 'status' in errorResponse ? errorResponse.status : 'unknown');
            console.error('[useCourses] Response data:', 'data' in errorResponse ? errorResponse.data : 'unknown');
          }
        }
        
        // Return empty default values instead of throwing
        setCourses([]);
        setPagination({
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        });
        
        return emptyResponse;
      }
      
      if (response.data.success) {
      // Check for data in either response.data.data or response.data.courses
      const coursesData = response.data.courses || 
                          (Array.isArray(response.data.data) ? response.data.data : []);
      
      // Nếu là admin thì ép kiểu CourseListItem, ngược lại là Course
      const processedCourses = (isAdmin
        ? (coursesData as CourseListItem[])
        : (coursesData as Course[])
      ).map(course => {
        // Normalize course status first
        const normalizedCourse = normalizeStatus(course);
        
        // Then add image URL with cache busting
        return {
          ...normalizedCourse,
          imageUrl: normalizedCourse.imageUrl ? `${normalizedCourse.imageUrl}?t=${Date.now()}` : '/images/placeholder-course.jpg'
        };
      });
      
      setCourses(processedCourses);
      
      // Xử lý pagination một cách an toàn
      if (response.data.meta && response.data.meta.pagination) {
        try {
          // Kiểm tra các trường cần thiết
          const paginationData = {
            page: Number(response.data.meta.pagination.page) || 1,
            pageSize: Number(response.data.meta.pagination.pageSize) || 10,
            totalItems: Number(response.data.meta.pagination.totalItems) || 0,
            totalPages: Number(response.data.meta.pagination.totalPages) || 1,
            hasNextPage: Boolean(response.data.meta.pagination.hasNextPage),
            hasPrevPage: Boolean(response.data.meta.pagination.hasPrevPage)
          };
          setPagination(paginationData);
        } catch (paginationError: unknown) {
          console.error('Error processing pagination data:', paginationError);
          // Sử dụng giá trị mặc định nếu có lỗi
          setPagination({
            page: 1,
            pageSize: 10,
            totalItems: response.data.data?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
          });
        }
      } else {
        // Không có dữ liệu pagination, sử dụng giá trị mặc định
        setPagination({
          page: 1,
          pageSize: 10,
          totalItems: response.data.data?.length || 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
        
        return response.data;
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (err: unknown) {
      console.error('[useCourses] Error fetching courses:', err);
      setError('Failed to fetch courses');
      
      // Don't throw error, instead return empty default response
      setCourses([]);
      setPagination({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      
      return emptyResponse;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  /**
   * Fetch a single course by ID
   */
  const fetchCourseById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<CourseResponseBasic>(`${baseUrl}/${id}`);
      
      if (response.data.success) {
        // Handle proper typing for the response data
        const courseData = response.data.data;
        if (!courseData) {
          throw new Error('Course data is empty');
        }
        
        // If data is an array, take the first item (though it should be a single object)
        const courseItem = Array.isArray(courseData) ? courseData[0] : courseData;
        
        // Normalize the course status before adding other properties
        const normalizedCourse = normalizeStatus(courseItem);
        
        // Thêm timestamp vào URL hình ảnh để tránh caching và xử lý ảnh rỗng
        const processedCourse = {
          ...normalizedCourse,
          imageUrl: normalizedCourse.imageUrl ? `${normalizedCourse.imageUrl}?t=${Date.now()}` : '/images/placeholder-course.jpg'
        };
        
        setCourse(processedCourse);
        return processedCourse;
      } else {
        throw new Error('Failed to fetch course');
      }
    } catch (err: unknown) {
      console.error('Error fetching course:', err);
      setError('Failed to fetch course');
      // Don't throw error, instead return null
      setCourse(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  /**
   * Fetch all course topics/categories from the database
   */
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/courses/topics');
      
      if (response.data.success) {
        // Handle multiple response format possibilities
        let topicsData: string[] = [];
        
        if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            // Direct array format
            topicsData = response.data.data;
          } else if (response.data.data.topics && Array.isArray(response.data.data.topics)) {
            // Nested topics format
            topicsData = response.data.data.topics;
            console.log('API Topics Response:', response.data.data.topics);
          }
        }
        
        if (topicsData.length > 0) {
          setTopics(topicsData);
          return topicsData;
        }
      }
      
      // Fallback to default topics if API fails or returns empty data
      const fallbackTopics = [
        'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
        'HTML', 'CSS', 'Python', 'Data Science', 'Machine Learning',
        'Web Development', 'Backend', 'Frontend', 'Database', 'DevOps'
      ];
      setTopics(fallbackTopics);
      return fallbackTopics;
    } catch (err: unknown) {
      console.error('Error fetching course topics:', err);
      setError('Failed to fetch course topics');
      
      // Fallback to default topics if API fails
      const fallbackTopics = [
        'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
        'HTML', 'CSS', 'Python', 'Data Science', 'Machine Learning',
        'Web Development', 'Backend', 'Frontend', 'Database', 'DevOps'
      ];
      setTopics(fallbackTopics);
      return fallbackTopics;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new course (admin only)
   */
  const createCourse = useCallback(async (data): Promise<Course | CourseListItem | null> => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${baseUrl}`, data);
      
      if (response.data.success) {
        // Make sure to normalize status when returning the created course
        return normalizeStatus(response.data.data);
      } else {
        throw new Error('Failed to create course');
      }
    } catch (err: unknown) {
      console.error('Error creating course:', err);
      setError('Failed to create course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Update an existing course (admin only)
   */
  const updateCourse = useCallback(async (id: string, data): Promise<Course | CourseListItem | null> => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Sử dụng PUT thay vì PATCH để khớp với API endpoint
      const response = await axios.put(`${baseUrl}/${id}`, data);
      
      if (response.data.success) {
        // Make sure to normalize status when returning the updated course
        return normalizeStatus(response.data.data);
      } else {
        throw new Error('Failed to update course');
      }
    } catch (err: unknown) {
      console.error('Error updating course:', err);
      setError('Failed to update course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Delete a course (admin only)
   */
  const deleteCourse = useCallback(async (id: string): Promise<{ success: boolean } | null> => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`${baseUrl}/${id}`);
      
      if (response.data.success) {
        // Refresh courses list after successful deletion
        await fetchCourses();
        return { success: true };
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (err: unknown) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin, fetchCourses]);

  return {
    loading,
    error,
    courses,
    course,
    topics,
    levels,
    pagination,
    fetchCourses,
    fetchCourseById,
    fetchTopics,
    createCourse,
    updateCourse,
    deleteCourse,
  };
}

export default useCourses;