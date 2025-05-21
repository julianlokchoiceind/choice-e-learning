'use client';

import { 
  QueryClient, 
  QueryClientProvider, 
  DefaultOptions,
  QueryCache,
  MutationCache
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import toast from 'react-hot-toast';
import React, { useState } from 'react';

/**
 * Props for QueryProvider component
 * @property {React.ReactNode} children - Child components to be wrapped by the provider
 * @property {DefaultOptions} [defaultOptions] - Optional custom default options to override the default configuration
 */
export interface QueryProviderProps {
  children: React.ReactNode;
  defaultOptions?: DefaultOptions;
}

/**
 * QueryProvider Component
 * 
 * Configures and provides React Query context to the application with:
 * - Optimized default settings for query caching and staleness
 * - Global error handling with toast notifications
 * - Development tools for debugging
 * 
 * @param {QueryProviderProps} props - Component props
 * @returns {JSX.Element} The provider component
 * 
 * @example
 * // Basic usage in app layout
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * 
 * @example
 * // With custom options
 * <QueryProvider defaultOptions={{
 *   queries: {
 *     staleTime: 5 * 60 * 1000 // 5 minutes
 *   }
 * }}>
 *   <App />
 * </QueryProvider>
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ 
  children,
  defaultOptions
}) => {
  // Create a new QueryClient instance for each session with default configuration
  const [queryClient] = useState(() => {
    return new QueryClient({
      queryCache: new QueryCache({
        onError: (error, query) => {
          // Only show error toast if the query has no error boundary
          if (query.meta?.suppressErrorToast !== true) {
            toast.error(
              `Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`,
              {
                id: `query-error-${query.queryKey.join('-')}`, // Prevent duplicate toasts
                duration: 5000
              }
            );
          }
        }
      }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _context, mutation) => {
          // Only show error toast if the mutation has no error boundary
          if (mutation.meta?.suppressErrorToast !== true) {
            toast.error(
              `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              {
                id: `mutation-error-${Date.now()}`,
                duration: 5000
              }
            );
          }
        }
      }),
      defaultOptions: defaultOptions ?? {
        queries: {
          // Default values for query options
          staleTime: 60 * 1000, // 1 minute before data is considered stale
          gcTime: 5 * 60 * 1000, // 5 minutes of inactive cache retention (formerly cacheTime)
          retry: 1, // Only retry failed queries once
          refetchOnWindowFocus: false, // Don't auto refetch when window regains focus
          refetchOnMount: true, // Refetch on component mount if data is stale
        },
        mutations: {
          // Default values for mutation options
          retry: 0, // Don't retry failed mutations by default
          onError: (err) => {
            console.error('Mutation error:', err);
          }
        }
      }
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider; 