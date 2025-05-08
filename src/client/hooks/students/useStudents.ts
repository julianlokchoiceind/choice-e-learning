'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu Student
interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  grade?: string | null;
  imageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface StudentFilter {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface StudentResult {
  data: Student[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useStudents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  /**
   * Fetch students with filtering and pagination
   */
  const fetchStudents = useCallback(async (filters: StudentFilter = {}) => {
    console.log('[HOOK] Starting fetchStudents with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      // Build query string with detailed logging
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const url = `/api/admin/students?${params.toString()}`;
      console.log(`Calling API: ${url}`);
      
      const response = await axios.get(url);
      console.log('[CLIENT] API Response:', JSON.stringify(response.data));
      
      // Log headers and status
      console.log('[CLIENT] Response status:', response.status);
      console.log('[CLIENT] Content type:', response.headers['content-type']);

      // Log the full API response for debugging
      console.log('[CLIENT] Full API Response object:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });
      
      // API response should be in format: {success: true, data: [...], meta: {...}}
      if (!response.data) {
        console.error('Invalid API response structure (empty):', response.data);
        setStudents([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        };
      }
      
      // Use the direct data format from the API response
      const responseData = response.data;

      try {
        // Kiểm tra data có đúng cấu trúc không
        if (!responseData.success || !responseData.data || !Array.isArray(responseData.data)) {
          console.error('Missing or invalid data array in response:', responseData);
          setStudents([]);
          setPagination({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          });
          return {
            data: [],
            meta: {
              total: 0,
              page: 1, 
              limit: 10,
              totalPages: 0
            }
          };
        }

        // Xử lý dữ liệu thành công
        console.log('Found data in response:', responseData.data.length, 'students');
        const studentData = responseData.data;
        const meta = responseData.meta || {
          total: studentData.length,
          page: 1,
          limit: 10,
          totalPages: 1
        };

        // Parse dates và xử lý null/undefined
        const studentsWithDates = studentData.map((student) => {
          console.log('Processing student data:', {
            id: student.id,
            name: student.name || 'Unknown',
            email: student.email,
            role: student.role
          });
          
          return {
            id: student.id,
            name: student.name || 'Unknown',
            email: student.email,
            phone: student.phone || '-',
            address: student.address || '-',
            city: student.city || '-',
            grade: student.grade || '-',
            imageUrl: student.imageUrl,
            createdAt: new Date(student.createdAt),
            updatedAt: new Date(student.updatedAt)
          };
        });

        console.log(`Successfully processed ${studentsWithDates.length} students`);
        
        console.log('[HOOK] Setting students state with data:', studentsWithDates.length, 'students');
        setStudents(studentsWithDates);
        console.log('[HOOK] Setting pagination state with data:', meta);
        setPagination(meta);

        return {
          data: studentsWithDates,
          meta
        };
      } catch (parseError: unknown) {
        console.error('Error parsing student data:', parseError);
        // Fallback to empty arrays instead of throwing errors
        setStudents([]);
        setPagination({
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
        return {
          data: [],
          meta: {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
          }
        };
      }
    } catch (err: unknown) {
      console.error('Error fetching students:', err);
      // Don't set error state to avoid showing error messages
      // setError(err?.response?.data?.error || err?.message || 'Failed to fetch students');
      setStudents([]);
      return {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
    } finally {
      console.log('[HOOK] fetchStudents completed, setting loading=false');
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single student by ID
   */
  const fetchStudentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/admin/students/${id}`);
      
      if (response.data.success) {
        // Parse dates
        const studentData = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt),
          updatedAt: new Date(response.data.data.updatedAt)
        };
        
        setStudent(studentData);
        return studentData;
      } else {
        throw new Error(response.data.error || 'Failed to fetch student');
      }
    } catch (err: unknown) {
      console.error('Error fetching student:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err && 
        typeof err.response === 'object' && err.response !== null && 'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ? 
        String(err.response.data.error) : 
        err instanceof Error ? err.message : 
        'Failed to fetch student';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new student
   */
  const createStudent = useCallback(async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/admin/students', data);
      
      if (response.data.success) {
        // Parse dates
        const studentData = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt),
          updatedAt: new Date(response.data.data.updatedAt)
        };
        
        return studentData;
      } else {
        throw new Error(response.data.error || 'Failed to create student');
      }
    } catch (err: unknown) {
      console.error('Error creating student:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err && 
        typeof err.response === 'object' && err.response !== null && 'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ? 
        String(err.response.data.error) : 
        err instanceof Error ? err.message : 
        'Failed to create student';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing student
   */
  const updateStudent = useCallback(async (id: string, data: Partial<Omit<Student, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch(`/api/admin/students/${id}`, data);
      
      if (response.data.success) {
        // Parse dates
        const studentData = {
          ...response.data.data,
          createdAt: new Date(response.data.data.createdAt),
          updatedAt: new Date(response.data.data.updatedAt)
        };
        
        return studentData;
      } else {
        throw new Error(response.data.error || 'Failed to update student');
      }
    } catch (err: unknown) {
      console.error('Error updating student:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err && 
        typeof err.response === 'object' && err.response !== null && 'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ? 
        String(err.response.data.error) : 
        err instanceof Error ? err.message : 
        'Failed to update student';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a student
   */
  const deleteStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/api/admin/students/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to delete student');
      }
    } catch (err: unknown) {
      console.error('Error deleting student:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err && 
        typeof err.response === 'object' && err.response !== null && 'data' in err.response && 
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ? 
        String(err.response.data.error) : 
        err instanceof Error ? err.message : 
        'Failed to delete student';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    students,
    student,
    pagination,
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
