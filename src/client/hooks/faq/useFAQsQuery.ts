'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import apiClient from '@/client/utils/http/api-client';
import { useToast } from '@/client/hooks/common/useToast';
import { useQueryUtils } from '@/client/hooks/common/useQueryUtils';
import { 
  FAQItem, 
  CreateFAQInput, 
  UpdateFAQInput, 
  FAQFilter,
  FAQPaginatedResult
} from '@/shared/types/faq';

/**
 * API endpoints for FAQ operations
 */
const API = {
  FAQS: '/api/faqs',
  FAQ: (id: string) => `/api/faqs/${id}`,
};

/**
 * Hook for FAQ data CRUD operations using React Query
 * 
 * Provides functions for fetching, creating, updating, and deleting FAQs
 * with proper loading, error handling, and success notifications.
 * 
 * @returns Object containing React Query hooks for FAQ operations
 * 
 * @example
 * // Fetch all FAQs
 * const { data, isLoading, error } = useGetFAQs();
 * 
 * @example
 * // Fetch a specific FAQ
 * const { data, isLoading, error } = useGetFAQ('faq-id');
 * 
 * @example
 * // Create a new FAQ
 * const { mutate, isLoading } = useCreateFAQ();
 * mutate({ question: 'New question?', answer: 'The answer', category: 'General' });
 */
export const useFAQsQuery = () => {
  const queryClient = useQueryClient();
  const { success } = useToast();
  const { showErrorToast } = useQueryUtils();

  /**
   * Fetch all FAQs with optional filtering
   * 
   * @param filter - Optional filter parameters for the FAQs query
   * @param options - Additional React Query options
   * @returns Query result with FAQs data, loading state, and error
   */
  const useGetFAQs = (
    filter?: FAQFilter,
    options?: UseQueryOptions<FAQPaginatedResult, Error, FAQPaginatedResult, (string | FAQFilter | undefined)[]>
  ) => {
    return useQuery({
      queryKey: ['faqs', filter],
      queryFn: async (): Promise<FAQPaginatedResult> => {
        const response = await apiClient.get(API.FAQS, { params: filter });
        return response.data;
      },
      ...options
    });
  };

  /**
   * Fetch a specific FAQ by ID
   * 
   * @param id - The ID of the FAQ to fetch
   * @param options - Additional React Query options
   * @returns Query result with FAQ data, loading state, and error
   */
  const useGetFAQ = (
    id: string,
    options?: UseQueryOptions<FAQItem, Error, FAQItem, (string)[]>
  ) => {
    return useQuery({
      queryKey: ['faqs', id],
      queryFn: async (): Promise<FAQItem> => {
        const response = await apiClient.get(API.FAQ(id));
        return response.data;
      },
      enabled: !!id, // Only run the query if ID is provided
      ...options
    });
  };

  /**
   * Create a new FAQ
   * 
   * @returns Mutation function and state for creating a FAQ
   */
  const useCreateFAQ = () => {
    return useMutation({
      mutationFn: async (data: CreateFAQInput): Promise<FAQItem> => {
        const response = await apiClient.post(API.FAQS, data);
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate FAQs query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
        success('FAQ created successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to create FAQ');
        throw err;
      },
    });
  };

  /**
   * Update an existing FAQ
   * 
   * @returns Mutation function and state for updating a FAQ
   */
  const useUpdateFAQ = () => {
    return useMutation({
      mutationFn: async (params: { id: string; data: UpdateFAQInput }): Promise<FAQItem> => {
        const { id, data } = params;
        const response = await apiClient.put(API.FAQ(id), data);
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific FAQ query and the FAQs list
        queryClient.invalidateQueries({ queryKey: ['faqs', data.id] });
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
        success('FAQ updated successfully');
        return data;
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to update FAQ');
        throw err;
      },
    });
  };

  /**
   * Delete a FAQ
   * 
   * @returns Mutation function and state for deleting a FAQ
   */
  const useDeleteFAQ = () => {
    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        await apiClient.delete(API.FAQ(id));
      },
      onSuccess: (_data, id) => {
        // Remove FAQ from cache and invalidate FAQs list
        queryClient.removeQueries({ queryKey: ['faqs', id] });
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
        success('FAQ deleted successfully');
      },
      onError: (err: AxiosError) => {
        showErrorToast(err, 'Failed to delete FAQ');
        throw err;
      },
    });
  };

  return {
    useGetFAQs,
    useGetFAQ,
    useCreateFAQ,
    useUpdateFAQ,
    useDeleteFAQ,
  };
};

export default useFAQsQuery; 