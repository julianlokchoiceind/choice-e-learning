import { useState, useCallback } from 'react';
import axios from 'axios';
import { Course } from '@prisma/client';

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

interface CourseResponse {
  success: boolean;
  data: Course[];
  meta: {
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [levels, setLevels] = useState(['beginner', 'intermediate', 'advanced']);
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
  const fetchCourses = useCallback(async (filters: CourseFilter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      
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
      
      const response = await axios.get<{ success: boolean, data: Course[], meta: { pagination: any } }>(`${baseUrl}?${params.toString()}`);
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Thêm timestamp vào URL hình ảnh để tránh caching
        const processedCourses = response.data.data.map(course => ({
          ...course,
          imageUrl: course.imageUrl ? `${course.imageUrl}?t=${Date.now()}` : course.imageUrl
        }));
        
        setCourses(processedCourses);
        if (response.data.meta && response.data.meta.pagination) {
          setPagination(response.data.meta.pagination);
        }
        
        return response.data;
      } else {
        throw new Error('Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to fetch courses');
      throw err;
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
      const response = await axios.get<{ success: boolean, data: Course }>(`${baseUrl}/${id}`);
      
      if (response.data.success) {
        // Thêm timestamp vào URL hình ảnh để tránh caching
        const processedCourse = {
          ...response.data.data,
          imageUrl: response.data.data.imageUrl ? `${response.data.data.imageUrl}?t=${Date.now()}` : response.data.data.imageUrl
        };
        
        setCourse(processedCourse);
        return processedCourse;
      } else {
        throw new Error('Failed to fetch course');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to fetch course');
      throw err;
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
      
      if (response.data.success && response.data.data && Array.isArray(response.data.data.topics)) {
        console.log('API Topics Response:', response.data.data.topics);
        setTopics(response.data.data.topics);
        return response.data.data.topics;
      } else {
        // Fallback to default topics if API fails
        const fallbackTopics = [
          'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
          'HTML', 'CSS', 'Python', 'Data Science', 'Machine Learning',
          'Web Development', 'Backend', 'Frontend', 'Database', 'DevOps'
        ];
        setTopics(fallbackTopics);
        return fallbackTopics;
      }
    } catch (err) {
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
  const createCourse = useCallback(async (data: any) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<{ success: boolean, data: Course }>(`${baseUrl}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to create course');
      }
    } catch (err) {
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
  const updateCourse = useCallback(async (id: string, data: any) => {
  if (!isAdmin) {
  setError('Unauthorized');
  return null;
  }
  
  setLoading(true);
  setError(null);
  
  try {
  // Sử dụng PUT thay vì PATCH để khớp với API endpoint
      const response = await axios.put<{ success: boolean, data: Course }>(`${baseUrl}/${id}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to update course');
      }
    } catch (err) {
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
  const deleteCourse = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete<{ success: boolean, data: { success: boolean } }>(`${baseUrl}/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to delete course');
      }
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

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
