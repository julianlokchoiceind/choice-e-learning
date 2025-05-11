import { useState, useCallback } from 'react';
import axios from 'axios';
import { Topic, TopicFilter } from '@/shared/types/topics';

// Using TopicFilter from @/types/topics

interface TopicResponseSimple {
  success: boolean;
  data: Topic[];
  message?: string;
}

interface TopicResponsePaginated {
  success: boolean;
  data: Topic[];
  message?: string;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
      hasNextPage?: boolean;
      hasPrevPage?: boolean;
    }
  };
}

type TopicResponse = TopicResponseSimple | TopicResponsePaginated;

// Type guard to check if response has pagination metadata
function isPaginatedResponse(response): response is TopicResponsePaginated {
  return response && 'meta' in response && !!response.meta?.pagination;
}

function useTopics(isAdmin = false) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Base URL depending on if admin or public
  const baseUrl = isAdmin ? '/api/admin/topics' : '/api/courses/topics';

  /**
   * Fetch topics with filtering and pagination
   */
  const fetchTopics = useCallback(async (filters: TopicFilter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // For less complex requests, use the simple endpoint
      if (Object.keys(filters).length === 0) {
        console.log('Using simple topics endpoint for empty filters');
        const response = await axios.get<{ success: boolean, data: Topic[] }>(`${baseUrl}`);
        
        if (response.data.success) {
          setTopics(response.data.data);
          setPagination({
            page: 1,
            pageSize: response.data.data.length,
            totalItems: response.data.data.length,
            totalPages: 1,
          });
          return response.data;
        } else {
          throw new Error('Failed to fetch topics');
        }
      }
      
      // For more complex filtering, use the full endpoint with params
      // Build query string
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      // Improved handling for isActive filter
      if (filters.isActive !== undefined) {
      // Make sure to convert boolean to string correctly
      params.append('isActive', filters.isActive.toString());
      console.log(`Setting isActive filter to: ${filters.isActive}`);
      }
      
      // Log the full filters and request URL for debugging
      console.log('Fetching topics with filters:', filters);
      console.log(`Request URL: ${baseUrl}?${params.toString()}`);
      
      // Wrap API call in a try/catch block
      let response;
      try {
        console.log(`[useTopics] Calling API: ${baseUrl}?${params.toString()}`);
        response = await axios.get<TopicResponse>(`${baseUrl}?${params.toString()}`);
        
        // Debug log response details
        console.log('[useTopics] API Response success:', response.data.success);
        console.log('[useTopics] Response status:', response.status);
        console.log('[useTopics] Content type:', response.headers['content-type']);
        
        // Debug log response structure
        console.log('[useTopics] Topics response structure:', {
          success: response.data.success,
          hasData: !!response.data.data,
          dataLength: response.data.data?.length,
          hasMeta: isPaginatedResponse(response.data),
          hasPagination: isPaginatedResponse(response.data)
        });
        
        if (!response || !response.data) {
          console.error('[useTopics] Empty response from server');
          setTopics([]);
          setPagination({
            page: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          });
          return {
            data: [],
            meta: {
              pagination: {
                page: 1,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0
              }
            }
          };
        }
      } catch (apiError: unknown) {
        // Log detailed error information
        console.error('[useTopics] API call failed with error:', apiError);
        
        if (typeof apiError === 'object' && apiError !== null && 'response' in apiError) {
          const errorResponse = apiError.response;
          if (typeof errorResponse === 'object' && errorResponse !== null) {
            console.error('[useTopics] Response status:', 'status' in errorResponse ? errorResponse.status : 'unknown');
            console.error('[useTopics] Response data:', 'data' in errorResponse ? errorResponse.data : 'unknown');
          }
        }
        
        // Set empty results and return default response
        setTopics([]);
        setPagination({
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        });
        
        return {
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0
            }
          }
        };
      }
      
      if (response.data.success) {
        // Save the topics
        setTopics(response.data.data);
        
        // Handle pagination if it exists
        if (isPaginatedResponse(response.data)) {
          setPagination(response.data.meta.pagination);
        } else {
          // Reset pagination for responses without meta (simple API mode)
          setPagination({
            page: 1,
            pageSize: response.data.data.length,
            totalItems: response.data.data.length,
            totalPages: 1,
          });
        }
      } else {
        throw new Error('Failed to fetch topics');
      }
      
      return response.data;
    } catch (err: unknown) {
      console.error('[useTopics] Error fetching topics:', err);
      // Provide more detailed error information but don't throw
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err &&
        typeof err.response === 'object' && err.response !== null && 'data' in err.response &&
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ?
        String(err.response.data.error) :
        err instanceof Error ? err.message :
        'Failed to fetch topics';
      setError(errorMessage);
      
      // Set empty values
      setTopics([]);
      setPagination({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });
      
      // Return a valid response with empty data
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0
          }
        }
      };
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  /**
   * Fetch a single topic by ID
   */
  const fetchTopicById = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Debug log
      console.log(`[useTopics] Fetching topic by ID: ${id}`);
      
      let response;
      try {
        response = await axios.get<{ success: boolean, data: Topic }>(`${baseUrl}/${id}`);
        console.log('[useTopics] Topic fetch response:', response.data.success);
      } catch (apiError: unknown) {
        console.error('[useTopics] API error fetching topic:', apiError);
        
        if (typeof apiError === 'object' && apiError !== null && 'response' in apiError) {
          const errorResponse = apiError.response;
          if (typeof errorResponse === 'object' && errorResponse !== null) {
            console.error('[useTopics] Response status:', 'status' in errorResponse ? errorResponse.status : 'unknown');
            console.error('[useTopics] Response data:', 'data' in errorResponse ? errorResponse.data : 'unknown');
          }
        }
        
        // Return null instead of throwing
        setTopic(null);
        setError('Failed to fetch topic');
        setLoading(false);
        return null;
      }
      
      if (response.data.success) {
        setTopic(response.data.data);
        return response.data.data;
      } else {
        console.warn('[useTopics] API returned success:false');
        setTopic(null);
        setError('Failed to fetch topic');
        return null;
      }
    } catch (err: unknown) {
      console.error('[useTopics] Error in fetchTopicById:', err);
      setError('Failed to fetch topic');
      setTopic(null);
      // Don't throw
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Create a new topic (admin only)
   */
  const createTopic = useCallback(async (data: { name: string; description?: string; isActive?: boolean }) => {
    if (!isAdmin) {
      console.warn('[useTopics] Attempt to create topic without admin rights');
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[useTopics] Creating topic with data:', data);
      
      // Chuẩn hóa dữ liệu trước khi gọi API
      const sanitizedData = {
        name: data.name?.trim() || '',
        description: data.description?.trim() || undefined,
        isActive: data.isActive !== undefined ? data.isActive : true
      };
      
      console.log('[useTopics] Sanitized data:', sanitizedData);
      
      // Kiểm tra dữ liệu trước khi gọi API
      if (!sanitizedData.name) {
        console.error('[useTopics] Name is required');
        setError('Topic name is required');
        return null;
      }
      
      // Sử dụng axios để gọi API endpoint
      const response = await axios.post(`${baseUrl}`, sanitizedData, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Thêm timeout để tránh request bị treo
        timeout: 10000
      });
      
      console.log('[useTopics] Create topic API response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('[useTopics] Topic created successfully:', response.data.data);
        return response.data.data;
      } else {
        console.error('[useTopics] API returned success=false:', response.data);
        throw new Error(response.data?.error || 'Failed to create topic');
      }
    } catch (err: unknown) {
      console.error('[useTopics] Error creating topic:', err);
      
      // Log chi tiết hơn về response error
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorResponse = err.response;
        if (typeof errorResponse === 'object' && errorResponse !== null) {
          console.error('[useTopics] Response status:', 'status' in errorResponse ? errorResponse.status : 'unknown');
          console.error('[useTopics] Response data:', 'data' in errorResponse ? errorResponse.data : 'unknown');
        }
      }
      
      // Trích xuất thông báo lỗi từ response nếu có
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err &&
        typeof err.response === 'object' && err.response !== null && 'data' in err.response &&
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ?
        String(err.response.data.error) :
        err instanceof Error ? err.message :
        'Failed to create topic';
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Update an existing topic (admin only)
   */
  const updateTopic = useCallback(async (id: string, data: { name?: string; description?: string; isActive?: boolean }) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch<{ success: boolean, data: Topic }>(`${baseUrl}/${id}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to update topic');
      }
    } catch (err: unknown) {
      console.error('Error updating topic:', err);
      
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err &&
        typeof err.response === 'object' && err.response !== null && 'data' in err.response &&
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ?
        String(err.response.data.error) :
        err instanceof Error ? err.message :
        'Failed to update topic';
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Delete a topic (admin only)
   */
  const deleteTopic = useCallback(async (id: string) => {
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
        throw new Error('Failed to delete topic');
      }
    } catch (err: unknown) {
      console.error('Error deleting topic:', err);
      
      const errorMessage = typeof err === 'object' && err !== null && 'response' in err &&
        typeof err.response === 'object' && err.response !== null && 'data' in err.response &&
        typeof err.response.data === 'object' && err.response.data !== null && 'error' in err.response.data ?
        String(err.response.data.error) :
        err instanceof Error ? err.message :
        'Failed to delete topic';
      
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  return {
    loading,
    error,
    topics,
    topic,
    pagination,
    fetchTopics,
    fetchTopicById,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}

export default useTopics;
