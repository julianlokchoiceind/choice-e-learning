'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Topic, TopicFilter } from '@/shared/types/topics';

/**
 * React Query hook for managing topics
 */
const useTopicsQuery = () => {
  const queryClient = useQueryClient();
  const isAdmin = true; // Default to admin mode for this hook
  const baseUrl = isAdmin ? '/api/admin/topics' : '/api/courses/topics';

  /**
   * Get topics with optional filtering
   */
  const useGetTopics = (filters: TopicFilter = {}) => {
    return useQuery({
      queryKey: ['topics', filters],
      queryFn: async () => {
        try {
          // For simple requests, use the base endpoint
          if (Object.keys(filters).length === 0) {
            const response = await axios.get(`${baseUrl}`);
            return response.data.data;
          }
          
          // For complex filtering, build query string
          const params = new URLSearchParams();
          if (filters.search) params.append('search', filters.search);
          if (filters.page) params.append('page', filters.page.toString());
          if (filters.limit) params.append('limit', filters.limit.toString());
          if (filters.sortBy) params.append('sortBy', filters.sortBy);
          if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
          if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
          
          const response = await axios.get(`${baseUrl}?${params.toString()}`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch topics');
          }
          throw new Error('An unexpected error occurred');
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
          const response = await axios.get(`${baseUrl}/${topicId}`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch topic');
          }
          throw new Error('An unexpected error occurred');
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
          const response = await axios.post(`${baseUrl}`, data);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create topic');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: () => {
        // Invalidate topics queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['topics'] });
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
          const response = await axios.put(`${baseUrl}/${id}`, data);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update topic');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: (_, variables) => {
        // Invalidate specific topic query and topics list
        queryClient.invalidateQueries({ queryKey: ['topic', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['topics'] });
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
          const response = await axios.delete(`${baseUrl}/${id}`);
          return response.data.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete topic');
          }
          throw new Error('An unexpected error occurred');
        }
      },
      onSuccess: () => {
        // Invalidate topics queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['topics'] });
      }
    });
  };

  return {
    useGetTopics,
    useGetTopic,
    useCreateTopic,
    useUpdateTopic,
    useDeleteTopic
  };
};

export default useTopicsQuery; 