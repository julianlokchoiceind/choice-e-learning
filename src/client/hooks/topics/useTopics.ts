import { useState, useCallback } from 'react';
import axios from 'axios';
import { Topic, TopicFilter } from '@/types/topics';

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
  const baseUrl = isAdmin ? '/api/admin/topics' : '/api/topics';

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
      
      const response = await axios.get<TopicResponse>(`${baseUrl}?${params.toString()}`);
      
      // Debug log response structure
      console.log('Topics response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasMeta: !!response.data.meta,
        hasPagination: response.data.meta && !!response.data.meta.pagination
      });
      
      if (response.data.success) {
        // Save the topics
        setTopics(response.data.data);
        
        // Handle pagination if it exists
        if (response.data.meta && response.data.meta.pagination) {
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
    } catch (err: any) {
      console.error('Error fetching topics:', err);
      // Provide more detailed error information
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch topics';
      setError(errorMessage);
      throw err;
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
      const response = await axios.get<{ success: boolean, data: Topic }>(`${baseUrl}/${id}`);
      
      if (response.data.success) {
        setTopic(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Failed to fetch topic');
      }
    } catch (err) {
      console.error('Error fetching topic:', err);
      setError('Failed to fetch topic');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Create a new topic (admin only)
   */
  const createTopic = useCallback(async (data: { name: string; description?: string; isActive?: boolean }) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<{ success: boolean, data: Topic }>(`${baseUrl}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error('Failed to create topic');
      }
    } catch (err: any) {
      console.error('Error creating topic:', err);
      setError(err.response?.data?.error || 'Failed to create topic');
      throw err;
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
    } catch (err: any) {
      console.error('Error updating topic:', err);
      setError(err.response?.data?.error || 'Failed to update topic');
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
    } catch (err: any) {
      console.error('Error deleting topic:', err);
      setError(err.response?.data?.error || 'Failed to delete topic');
      throw err;
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
