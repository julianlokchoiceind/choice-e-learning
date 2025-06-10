'use client';

import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Custom types for error handling
 */
interface ApiError extends Error {
  status?: number;
  data?: {
    message?: string;
    error?: string;
  };
}

/**
 * Extracts meaningful error message from various error types
 * @param error - The error object to process
 * @returns A user-friendly error message
 */
const extractErrorMessage = (error: unknown): string => {
  // Handle Axios or fetch-like errors with response data
  if (error && typeof error === 'object' && 'data' in error) {
    const apiError = error as ApiError;
    
    // Try to get message from data.message or data.error
    if (apiError.data) {
      if (apiError.data.message) return apiError.data.message;
      if (apiError.data.error) return apiError.data.error;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle network errors
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
};

/**
 * Hook providing utility functions for React Query error handling
 * 
 * Provides standardized error handling for React Query operations
 * including error logging and toast notifications
 * 
 * @returns Object containing error handling utilities
 * 
 * @example
 * // Basic usage in a component with React Query
 * const { onError } = useQueryUtils();
 * 
 * const { data } = useQuery({
 *   queryKey: ['data'],
 *   queryFn: fetchData,
 *   onError,
 * });
 * 
 * @example
 * // Using the showErrorToast function directly
 * const { showErrorToast } = useQueryUtils();
 * 
 * try {
 *   // some operation
 * } catch (error) {
 *   showErrorToast(error);
 * }
 */
export const useQueryUtils = () => {
  // Use react-hot-toast directly instead of useToast

  /**
   * Displays an error toast with a user-friendly message
   * extracted from the error object
   * 
   * @param err - The error object from which to extract a message
   * @param fallbackMessage - Optional custom fallback message if error extraction fails
   */
  const showErrorToast = useCallback((
    err: unknown, 
    fallbackMessage = 'An unexpected error occurred'
  ) => {
    const message = extractErrorMessage(err) || fallbackMessage;
    toast.error(message);
  }, []);

  /**
   * Standard error handler for React Query operations
   * Logs the error to console and displays a toast notification
   * 
   * @param err - The error object from React Query
   */
  const onError = useCallback((err: unknown) => {
    // Log for debugging
    console.error('Query error:', err);
    
    // Show toast notification
    showErrorToast(err);
  }, [showErrorToast]);

  return {
    onError,
    showErrorToast,
  };
};

export default useQueryUtils; 