'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useApiRequest, ApiRequestError } from '@/client/hooks/common/useApiRequest';
// Remove direct useToast import as we're using QueryProvider for toasts
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
  FAQS: '/api/admin/faqs',
  FAQ: (id: string) => `/api/admin/faqs/${id}`,
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
  // Use QueryProvider's toast system via meta
  const { showErrorToast } = useQueryUtils();
  // Khởi tạo useApiRequest hook
  const apiRequest = useApiRequest();

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
        try {
          // Build query string
          const params = new URLSearchParams();
          if (filter?.search) params.append('search', filter.search);
          if (filter?.category) params.append('category', filter.category);
          if (filter?.page) params.append('page', filter.page.toString());
          if (filter?.limit) params.append('limit', filter.limit.toString());
          
          const response = await apiRequest.get(`${API.FAQS}?${params.toString()}`);
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error('Error fetching FAQs: Empty response');
            throw new Error('Failed to fetch FAQs: No data returned');
          }
          
          // Handle nested structure from apiSuccess: response.data = { success: true, data: { data: [...], meta: {...} } }
          return response.data.data || { data: [], meta: { total: 0 } };
        } catch (error) {
          console.error('Error fetching FAQs:', error);
          throw error;
        }
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
        try {
          if (!id) {
            throw new Error('FAQ ID is required');
          }
          
          const response = await apiRequest.get(API.FAQ(id));
          
          // Kiểm tra response null/undefined
          if (!response || !response.data) {
            console.error(`Error fetching FAQ ${id}: Empty response`);
            throw new Error('Failed to fetch FAQ: No data returned');
          }
          
          return response.data;
        } catch (error) {
          console.error(`Error fetching FAQ ${id}:`, error);
          throw error;
        }
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
        const response = await apiRequest.post(API.FAQS, data);
        if (!response || !response.data) {
          throw new Error('Failed to create FAQ: No data returned');
        }
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate FAQs query to refetch the list
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
        return data;
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to create FAQ');
        throw err;
      },
      meta: {
        successToast: 'FAQ created successfully'
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
        const response = await apiRequest.put(API.FAQ(id), data);
        if (!response || !response.data) {
          throw new Error('Failed to update FAQ: No data returned');
        }
        return response.data;
      },
      onSuccess: (data) => {
        // Invalidate specific FAQ query and the FAQs list
        queryClient.invalidateQueries({ queryKey: ['faqs', data.id] });
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
        return data;
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to update FAQ');
        throw err;
      },
      meta: {
        successToast: 'FAQ updated successfully'
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
        await apiRequest.delete(API.FAQ(id));
      },
      onSuccess: (_data, id) => {
        // Remove FAQ from cache and invalidate FAQs list
        queryClient.removeQueries({ queryKey: ['faqs', id] });
        queryClient.invalidateQueries({ queryKey: ['faqs'] });
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to delete FAQ');
        throw err;
      },
      meta: {
        successToast: 'FAQ deleted successfully'
      },
    });
  };

  /**
   * Bulk delete FAQs
   */
  const useBulkDeleteFAQs = () => {
    return useMutation({
      mutationFn: async (faqIds: string[]): Promise<any> => {
        const response = await apiRequest.post('/api/admin/faqs/bulk-delete', { faqIds });
        return response?.data;
      },
      onSuccess: () => {
        // Invalidate all FAQ queries to refresh the list
        queryClient.invalidateQueries({ 
          queryKey: ['faqs'],
          exact: false
        });
      },
      onError: (err: ApiRequestError) => {
        showErrorToast(err, 'Failed to delete FAQs');
        throw err;
      },
      meta: {
        successToast: 'FAQs deleted successfully',
        errorToast: 'Failed to delete FAQs'
      },
    });
  };

  return {
    useGetFAQs,
    useGetFAQ,
    useCreateFAQ,
    useUpdateFAQ,
    useDeleteFAQ,
    useBulkDeleteFAQs
  };
};

export default useFAQsQuery; 