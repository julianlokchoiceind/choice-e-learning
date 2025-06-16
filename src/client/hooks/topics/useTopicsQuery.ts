'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
import { Topic, TopicFilter } from '@/shared/types/topics';

/**
 * React Query hook for managing topics
 */
const useTopicsQuery = () => {
  const queryClient = useQueryClient();
  const isAdmin = true; // Default to admin mode for this hook
  const baseUrl = isAdmin ? '/api/admin/topics' : '/api/courses/topics';
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();

  /**
   * Get topics with optional filtering
   */
  const useGetTopics = (filters: TopicFilter = {}) => {
    return useQuery({
      queryKey: ['topics', filters],
      queryFn: async () => {
        try {
          let response;
          
          // For simple requests, use the base endpoint
          if (Object.keys(filters).length === 0) {
            response = await apiRequest.get(`${baseUrl}`);
          } else {
            // For complex filtering, build query string
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
            
            response = await apiRequest.get(`${baseUrl}?${params.toString()}`);
          }
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error('Error fetching topics: Empty response');
            throw new Error('Failed to fetch topics: No data returned');
          }
          
          // Extract the actual topics array from the API response
          // Ensure we return an array even if response.data.data is null/undefined
          const topicsData = response.data.data;
          return Array.isArray(topicsData) ? topicsData : [];
        } catch (error) {
          console.error('Error fetching topics:', error);
          const err = error as ApiRequestError;
          throw new Error(err.message || 'Failed to fetch topics');
        }
      }
    });
  };

  /**
   * Get a specific topic by ID
   */
  const useGetTopic = (topicId?: string) => {
    return useQuery({
      queryKey: ['topic', topicId],
      queryFn: async () => {
        try {
          if (!topicId) return null;
          
          const response = await apiRequest.get(`${baseUrl}/${topicId}`);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error(`Error fetching topic ${topicId}: Empty response`);
            throw new Error('Failed to fetch topic: No data returned');
          }
          
          // Extract the actual topic data from the API response
          return response.data.data;
        } catch (error) {
          console.error(`Error fetching topic ${topicId}:`, error);
          const err = error as ApiRequestError;
          throw new Error(err.message || 'Failed to fetch topic');
        }
      },
      enabled: !!topicId // Only run query if topicId is provided
    });
  };

  /**
   * Create a new topic
   */
  const useCreateTopic = () => {
    return useMutation({
      mutationFn: async (data: Partial<Topic>) => {
        try {
          const response = await apiRequest.post(baseUrl, data);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error('Error creating topic: Empty response');
            throw new Error('Failed to create topic: No data returned');
          }
          
          return response.data.data;
        } catch (error) {
          console.error('Error creating topic:', error);
          const err = error as ApiRequestError;
          throw new Error(err.message || 'Failed to create topic');
        }
      },
      onSuccess: () => {
        // Invalidate topics queries to refresh data
        queryClient.invalidateQueries({ 
          queryKey: ['topics'],
          exact: false
        });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Topic created successfully',
        errorToast: 'Failed to create topic'
      }
    });
  };

  /**
   * Update an existing topic
   */
  const useUpdateTopic = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<Topic> }) => {
        try {
          const response = await apiRequest.patch(`${baseUrl}/${id}`, data);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error(`Error updating topic ${id}: Empty response`);
            throw new Error('Failed to update topic: No data returned');
          }
          
          return response.data.data;
        } catch (error) {
          console.error(`Error updating topic ${id}:`, error);
          const err = error as ApiRequestError;
          throw new Error(err.message || 'Failed to update topic');
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate specific topic query and topics list
        queryClient.invalidateQueries({ queryKey: ['topic', variables.id] });
        queryClient.invalidateQueries({ 
          queryKey: ['topics'],
          exact: false
        });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Topic updated successfully',
        errorToast: 'Failed to update topic'
      }
    });
  };


  /**
   * Delete a topic
   */
  const useDeleteTopic = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        try {
          const response = await apiRequest.delete(`${baseUrl}/${id}`);
          
          // Xử lý trường hợp không có response data (thường là khi delete thành công)
          if (response && response.data) {
            return response.data.data;
          }
          
          return null; // Delete thành công nhưng không có data trả về
        } catch (error) {
          console.error(`Error deleting topic ${id}:`, error);
          const err = error as ApiRequestError;
          throw new Error(err.message || 'Failed to delete topic');
        }
      },
      onSuccess: () => {
        // Invalidate topics queries to refresh data
        queryClient.invalidateQueries({ 
          queryKey: ['topics'],
          exact: false
        });
      },
      // Use meta for toast notifications
      meta: {
        successToast: 'Topic deleted successfully',
        errorToast: 'Failed to delete topic'
      }
    });
  };

  /**
   * Bulk delete topics
   */
  const useBulkDeleteTopics = () => {
    return useMutation({
      mutationFn: async (topicIds: string[]): Promise<any> => {
        const response = await apiRequest.post('/api/admin/topics/bulk-delete', { topicIds });
        return response?.data;
      },
      onSuccess: () => {
        // Invalidate all topic queries to refresh the list
        queryClient.invalidateQueries({ 
          queryKey: ['topics'],
          exact: false
        });
      },
      onError: (err: ApiRequestError) => {
        // Error handled by mutation meta
        throw err;
      },
      meta: {
        successToast: 'Topics deleted successfully',
        errorToast: 'Failed to delete topics'
      },
    });
  };

  return {
    useGetTopics,
    useGetTopic,
    useCreateTopic,
    useUpdateTopic,
    useDeleteTopic,
    useBulkDeleteTopics
  };
};

export default useTopicsQuery; 