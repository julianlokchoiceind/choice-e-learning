'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import apiClient from '@/client/utils/http/api-client';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Types for the hook
export interface ApiRequestOptions<T = any> {
  // Request tracking options
  trackRequestInSession?: boolean;
  sessionKey?: string;
  idempotencyTimeout?: number; // in milliseconds
  
  // Request configuration
  headers?: Record<string, string>;
  withCredentials?: boolean;
  
  // Callbacks
  onSuccess?: (data: T) => void;
  onError?: (error: ApiRequestError) => void;
  onComplete?: () => void;
}

export interface ApiRequestState<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiRequestError | null;
  requestId: string | null;
}

export interface ApiRequestError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Custom hook for making API requests with state management
 * Features:
 * - Tracks loading, error, and data states
 * - Prevents duplicate requests
 * - Tracks requests in sessionStorage
 * - Creates unique request IDs
 * - Supports timeout for race conditions
 */
export function useApiRequest<T = any>(defaultOptions: ApiRequestOptions<T> = {}) {
  // State for tracking request status
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    requestId: null
  });
  
  // Refs for tracking in-flight requests
  const activeRequest = useRef<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup function for timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);
  
  /**
   * Check if a request is already in progress or in session storage
   */
  const isRequestInProgress = useCallback((sessionKey?: string): boolean => {
    // Check if there's an active request in this component
    if (activeRequest.current) return true;
    
    // Check sessionStorage if tracking is enabled
    if (sessionKey && typeof window !== 'undefined') {
      const storedRequest = sessionStorage.getItem(sessionKey);
      if (storedRequest) {
        try {
          const { timestamp, completed } = JSON.parse(storedRequest);
          
          // If the request is completed or older than 1 minute, it's not in progress
          if (completed || Date.now() - timestamp > 60000) {
            return false;
          }
          
          return true;
        } catch (e) {
          // If parsing fails, assume no valid request is in progress
          return false;
        }
      }
    }
    
    return false;
  }, []);
  
  /**
   * Track a request in session storage
   */
  const trackRequest = useCallback((
    sessionKey: string,
    requestId: string,
    completed: boolean = false
  ) => {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({
        requestId,
        timestamp: Date.now(),
        completed
      }));
    } catch (e) {
      console.error('Failed to track request in session storage:', e);
    }
  }, []);
  
  /**
   * Make an API request with the given method, URL, and options
   */
  const request = useCallback(async <D = any>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    url: string,
    data?: any,
    options: ApiRequestOptions<T> = {}
  ): Promise<AxiosResponse<T> | null> => {
    // Merge default options with request-specific options
    const mergedOptions = { ...defaultOptions, ...options };
    const {
      trackRequestInSession,
      sessionKey,
      idempotencyTimeout = 2000,
      headers,
      withCredentials,
      onSuccess,
      onError,
      onComplete
    } = mergedOptions;
    
    // Generate a unique request ID
    const requestId = uuidv4();
    
    // Check if we should track this request in session storage
    const actualSessionKey = trackRequestInSession ? (sessionKey || `api_request_${url}`) : undefined;
    
    // Check if a request is already in progress
    if (isRequestInProgress(actualSessionKey)) {
      console.log(`Request to ${url} already in progress, skipping duplicate`);
      return null;
    }
    
    // Mark this request as active
    activeRequest.current = requestId;
    
    // Track in session storage if enabled
    if (actualSessionKey) {
      trackRequest(actualSessionKey, requestId);
    }
    
    // Update state to loading
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      requestId
    }));
    
    // Set up idempotency timeout
    if (idempotencyTimeout > 0) {
      clearTimeouts();
      timeoutRef.current = setTimeout(() => {
        // Clear the active request after timeout
        if (activeRequest.current === requestId) {
          activeRequest.current = null;
        }
      }, idempotencyTimeout);
    }
    
    try {
      // Configure the request
      const config: AxiosRequestConfig = {
        headers: {
          ...headers,
          'X-Request-ID': requestId
        },
        withCredentials
      };
      
      // Make the request based on the method
      let response: AxiosResponse<T>;
      
      if (method === 'get' || method === 'delete') {
        response = await apiClient[method](url, config);
      } else {
        response = await apiClient[method](url, data, config);
      }
      
      // Update state with successful response
      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null
      }));
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Mark as completed in session storage
      if (actualSessionKey) {
        trackRequest(actualSessionKey, requestId, true);
      }
      
      return response;
    } catch (error) {
      // Handle error
      const apiError: ApiRequestError = {
        message: 'An unexpected error occurred',
        status: 500
      };
      
      // Extract error details from Axios error
      if (error instanceof Error) {
        apiError.message = error.message;
        
        // Handle Axios errors
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          apiError.status = axiosError.response.status;
          apiError.details = axiosError.response.data;
          
          // Try to extract error message from response
          if (
            typeof axiosError.response.data === 'object' && 
            axiosError.response.data !== null
          ) {
            const data = axiosError.response.data as any;
            if (data.error || data.message) {
              apiError.message = data.error || data.message;
            }
          }
        } else if (axiosError.request) {
          // Request was made but no response received
          apiError.message = 'No response received from server';
        }
      }
      
      // Update state with error
      setState(prev => ({
        ...prev,
        loading: false,
        error: apiError
      }));
      
      // Call error callback if provided
      if (onError) {
        onError(apiError);
      }
      
      // Mark as completed in session storage (even though it failed)
      if (actualSessionKey) {
        trackRequest(actualSessionKey, requestId, true);
      }
      
      throw error;
    } finally {
      // Clear the active request
      if (activeRequest.current === requestId) {
        activeRequest.current = null;
      }
      
      // Clear any timeouts
      clearTimeouts();
      
      // Call complete callback if provided
      if (onComplete) {
        onComplete();
      }
    }
  }, [defaultOptions, isRequestInProgress, trackRequest, clearTimeouts]);
  
  // Create convenience methods for different HTTP methods
  const get = useCallback(<D = any>(url: string, options?: ApiRequestOptions<T>) => 
    request<D>('get', url, undefined, options), [request]);
  
  const post = useCallback(<D = any>(url: string, data?: any, options?: ApiRequestOptions<T>) => 
    request<D>('post', url, data, options), [request]);
  
  const put = useCallback(<D = any>(url: string, data?: any, options?: ApiRequestOptions<T>) => 
    request<D>('put', url, data, options), [request]);
  
  const patch = useCallback(<D = any>(url: string, data?: any, options?: ApiRequestOptions<T>) => 
    request<D>('patch', url, data, options), [request]);
  
  const del = useCallback(<D = any>(url: string, options?: ApiRequestOptions<T>) => 
    request<D>('delete', url, undefined, options), [request]);
  
  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      requestId: null
    });
  }, []);
  
  return {
    ...state,
    request,
    get,
    post,
    put,
    patch,
    delete: del,
    reset
  };
} 