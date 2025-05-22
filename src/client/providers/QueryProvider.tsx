'use client';

import { 
  QueryClient, 
  QueryClientProvider, 
  DefaultOptions,
  QueryCache,
  MutationCache,
  QueryClientConfig
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import toast from 'react-hot-toast';
import React, { useState } from 'react';

/**
 * Props for QueryProvider component
 * @property {React.ReactNode} children - Child components to be wrapped by the provider
 * @property {DefaultOptions} [defaultOptions] - Optional custom default options to override the default configuration
 * @property {boolean} [enableNetworkStatusIndicator] - Enable network status indicator for queries
 * @property {boolean} [enableDevTools] - Enable React Query DevTools (default: true in development, false in production)
 * @property {boolean} [initialIsOpen] - Whether DevTools should be open by default (default: false)
 * @property {'bottom' | 'top' | 'left' | 'right'} [position] - Position of the DevTools panel
 */
export interface QueryProviderProps {
  children: React.ReactNode;
  defaultOptions?: DefaultOptions;
  enableNetworkStatusIndicator?: boolean;
  enableDevTools?: boolean;
  initialIsOpen?: boolean;
  position?: 'bottom' | 'top' | 'left' | 'right';
}

/**
 * Data lifetime constants for different data types
 * Adjust these values based on how frequently the data changes in your application
 */
export const DATA_LIFETIME = {
  // Static data that rarely changes (e.g., enums, constants)
  STATIC: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  // Reference data that changes occasionally (e.g., topics, categories)
  REFERENCE: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  // Standard data with moderate update frequency (e.g., courses, FAQs)
  STANDARD: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  // Dynamic data that changes frequently (e.g., user profile, notifications)
  DYNAMIC: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  // Real-time data that needs frequent updates (e.g., chat messages, active users)
  REALTIME: {
    staleTime: 0, // Always stale
    gcTime: 60 * 1000, // 1 minute
  },
};

/**
 * QueryProvider Component
 * 
 * Configures and provides React Query context to the application with:
 * - Optimized default settings for query caching and staleness based on data types
 * - Global error handling with toast notifications
 * - Support for structural sharing to minimize re-renders
 * - Query deduplication to prevent redundant network requests
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
 * 
 * @example
 * // With DevTools configuration
 * <QueryProvider 
 *   enableDevTools={true} 
 *   initialIsOpen={true}
 *   position="bottom"
 * >
 *   <App />
 * </QueryProvider>
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ 
  children,
  defaultOptions,
  enableNetworkStatusIndicator = false,
  enableDevTools = process.env.NODE_ENV === 'development',
  initialIsOpen = false,
  position = 'bottom'
}) => {
  // Create a new QueryClient instance for each session with optimized configuration
  const [queryClient] = useState(() => {
    const config: QueryClientConfig = {
      queryCache: new QueryCache({
        onError: (error, query) => {
          // Only show error toast if the query has no error boundary
          if (query.meta?.suppressErrorToast !== true) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Unknown error';
            
            // Get context from queryKey for more descriptive error messages
            const queryContext = query.queryKey[0] 
              ? ` while fetching ${String(query.queryKey[0])}` 
              : '';
            
            toast.error(
              `Something went wrong${queryContext}: ${errorMessage}`,
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
            const errorMessage = error instanceof Error 
              ? error.message 
              : 'Unknown error';
            
            // Get context from mutationKey for more descriptive error messages
            const mutationContext = mutation.options.mutationKey 
              ? ` during ${String(mutation.options.mutationKey[0])}` 
              : '';
            
            toast.error(
              `Operation failed${mutationContext}: ${errorMessage}`,
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
          // Default values for query options - using STANDARD data lifetime as default
          staleTime: DATA_LIFETIME.STANDARD.staleTime,
          gcTime: DATA_LIFETIME.STANDARD.gcTime,
          retry: 1, // Only retry failed queries once
          refetchOnWindowFocus: true, // Enable automatic refetch when window regains focus for improved data freshness
          refetchOnMount: true, // Refetch on component mount if data is stale
          refetchOnReconnect: true, // Refetch when network reconnects
          structuralSharing: true, // Enable structural sharing to minimize re-renders
        },
        mutations: {
          // Default values for mutation options
          retry: 0, // Don't retry failed mutations by default
          onError: (err) => {
            console.error('Mutation error:', err);
          }
        }
      }
    };
    
    return new QueryClient(config);
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query DevTools for debugging (only in development) */}
      {enableDevTools && (
        <ReactQueryDevtools 
          initialIsOpen={initialIsOpen}
          position={position}
          styleNonce="react-query" // Security improvement for CSP
        />
      )}
    </QueryClientProvider>
  );
};

/**
 * How to use React Query DevTools
 * 
 * React Query DevTools provides a UI to help with debugging queries and the cache.
 * It is automatically included in development builds but not in production.
 * 
 * Key features:
 * 
 * 1. Query Explorer:
 *    - Shows all active queries with their keys, status, and data
 *    - Click on a query to see detailed information
 *    - Filter queries by status (active, inactive, stale)
 * 
 * 2. Cache Inspector:
 *    - Examine the current state of the React Query cache
 *    - See what data is cached for each query
 *    - Understand when data becomes stale
 * 
 * 3. Query Actions:
 *    - Manually refetch queries
 *    - Reset queries to their initial state
 *    - Clear the cache for specific queries
 *    - Observe real-time query status changes
 * 
 * 4. Request Tracing:
 *    - See when queries are executed
 *    - Track how long queries take to complete
 *    - Monitor retries and background refreshes
 * 
 * To open the DevTools:
 *   - Click the floating {_} button in the corner of the screen
 *   - Use the panel to debug your queries
 * 
 * Configuration options (via QueryProvider props):
 *   - enableDevTools: Toggle visibility of the DevTools (default: true in development)
 *   - initialIsOpen: Whether DevTools should be open by default (default: false)
 *   - position: Where the DevTools panel should appear ('bottom', 'top', 'left', 'right')
 */

export default QueryProvider; 