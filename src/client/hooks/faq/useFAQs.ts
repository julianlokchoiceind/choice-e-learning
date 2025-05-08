import { useState, useCallback } from 'react';
import axios from 'axios';
import { FAQ } from '@prisma/client';

interface FAQFilter {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FAQPaginatedResult {
  data: FAQ[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useFAQs(isAdmin = false) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Base URL depending on if admin or public
  const baseUrl = isAdmin ? '/api/admin/faqs' : '/api/faqs';

  /**
   * Fetch FAQs with filtering and pagination
   */
  const fetchFAQs = useCallback(async (filters: FAQFilter = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      
      const response = await axios.get<{ data: FAQPaginatedResult }>(`${baseUrl}?${params.toString()}`);
      
      setFaqs(response.data.data.data);
      setPagination(response.data.data.meta);
      
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to fetch FAQs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  /**
   * Fetch a single FAQ by ID
   */
  const fetchFAQById = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<{ data: FAQ }>(`${baseUrl}/${id}`);
      setFaq(response.data.data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error fetching FAQ:', err);
      setError('Failed to fetch FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Fetch all FAQ categories
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<{ data: string[] }>(`${baseUrl}/categories`);
      setCategories(response.data.data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error fetching FAQ categories:', err);
      setError('Failed to fetch FAQ categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  /**
   * Create a new FAQ (admin only)
   */
  const createFAQ = useCallback(async (data: { question: string; answer: string; category: string }) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<{ data: FAQ }>(`${baseUrl}`, data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error creating FAQ:', err);
      setError('Failed to create FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Update an existing FAQ (admin only)
   */
  const updateFAQ = useCallback(async (id: string, data: { question?: string; answer?: string; category?: string }) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.patch<{ data: FAQ }>(`${baseUrl}/${id}`, data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error updating FAQ:', err);
      setError('Failed to update FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  /**
   * Delete a FAQ (admin only)
   */
  const deleteFAQ = useCallback(async (id: string) => {
    if (!isAdmin) {
      setError('Unauthorized');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.delete<{ data: { success: boolean } }>(`${baseUrl}/${id}`);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error deleting FAQ:', err);
      setError('Failed to delete FAQ');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, isAdmin]);

  return {
    loading,
    error,
    faqs,
    faq,
    categories,
    pagination,
    fetchFAQs,
    fetchFAQById,
    fetchCategories,
    createFAQ,
    updateFAQ,
    deleteFAQ,
  };
}
