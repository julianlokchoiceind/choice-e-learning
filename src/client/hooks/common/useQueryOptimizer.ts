'use client';

import { useCallback } from 'react';
import { UseQueryOptions, useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { DATA_LIFETIME } from '@/client/providers/QueryProvider';

/**
 * Type definition for optimistic update config
 */
interface OptimisticUpdateConfig<TData, TVariables> {
  /**
   * Query keys to update optimistically
   */
  queryKey: unknown[];
  
  /**
   * Function to get the updated data based on current data and mutation variables
   */
  updater: (oldData: TData | undefined, variables: TVariables) => TData;
}

/**
 * Type definition for different data lifetime categories
 */
export type DataLifetimeCategory = 'STATIC' | 'REFERENCE' | 'STANDARD' | 'DYNAMIC' | 'REALTIME';

/**
 * Hook providing utilities for optimizing React Query usage
 * 
 * This hook provides:
 * - Functions to apply optimal cache settings based on data type
 * - Utilities for optimistic updates
 * - Helper for prefetching related queries
 * 
 * @returns Object containing optimization utilities
 * 
 * @example
 * // Apply optimal cache settings for reference data
 * const { getQueryOptions } = useQueryOptimizer();
 * const options = getQueryOptions('REFERENCE');
 * 
 * const { data } = useQuery({
 *   queryKey: ['topics'],
 *   queryFn: fetchTopics,
 *   ...options
 * });
 * 
 * @example
 * // Use optimistic updates
 * const { getOptimisticMutation } = useQueryOptimizer();
 * const updateCourseMutation = getOptimisticMutation({
 *   mutationFn: updateCourse,
 *   queryKey: ['course', courseId],
 *   updater: (oldData, newData) => ({ ...oldData, ...newData })
 * });
 */
export const useQueryOptimizer = () => {
  const queryClient = useQueryClient();
  
  /**
   * Get optimal query options based on data lifetime category
   * 
   * @param category - The data lifetime category
   * @returns Query options with optimal cache settings
   */
  const getQueryOptions = useCallback(<TData, TError, TQueryKey extends [string, ...unknown[]]>(
    category: DataLifetimeCategory,
    selectFn?: (data: any) => TData
  ): Partial<UseQueryOptions<any, TError, TData, TQueryKey>> => {
    const options: Partial<UseQueryOptions<any, TError, TData, TQueryKey>> = {
      staleTime: DATA_LIFETIME[category].staleTime,
      gcTime: DATA_LIFETIME[category].gcTime,
      // Enable structural sharing to minimize re-renders
      structuralSharing: true,
    };
    
    // Apply select function if provided for better memoization
    if (selectFn) {
      options.select = selectFn;
    }
    
    return options;
  }, []);
  
  /**
   * Setup prefetching for anticipated user actions
   * 
   * @param queryKeys - Array of query keys to prefetch
   * @param queryFns - Array of query functions corresponding to the keys
   */
  const setupPrefetching = useCallback((
    queryKeys: unknown[][],
    queryFns: Array<() => Promise<unknown>>,
    category: DataLifetimeCategory = 'STANDARD'
  ) => {
    if (queryKeys.length !== queryFns.length) {
      console.error('Query keys and functions arrays must be the same length');
      return;
    }
    
    const options = {
      staleTime: DATA_LIFETIME[category].staleTime,
    };
    
    queryKeys.forEach((key, index) => {
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: queryFns[index],
        ...options
      });
    });
  }, [queryClient]);
  
  /**
   * Create a mutation with optimistic updates
   * 
   * @param config - Configuration for the optimistic update
   * @returns Mutation hook with optimistic updates
   */
  const getOptimisticMutation = useCallback(<TData, TVariables, TContext, TError>(
    config: {
      mutationFn: (variables: TVariables) => Promise<TData>,
      optimisticUpdates?: OptimisticUpdateConfig<TData, TVariables>[] | OptimisticUpdateConfig<TData, TVariables>,
      invalidateQueries?: unknown[][],
      onSuccessCallback?: (data: TData, variables: TVariables, context: TContext | undefined) => void | Promise<unknown>,
      onErrorCallback?: (error: TError, variables: TVariables, context: TContext | undefined) => void | Promise<unknown>,
      options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn' | 'onMutate' | 'onSuccess' | 'onError'>
    }
  ) => {
    // Convert single update config to array
    const optimisticUpdates = Array.isArray(config.optimisticUpdates) 
      ? config.optimisticUpdates 
      : config.optimisticUpdates ? [config.optimisticUpdates] : [];
    
    return useMutation<TData, TError, TVariables, TContext>({
      mutationFn: config.mutationFn,
      
      // Apply optimistic updates before mutation
      onMutate: async (variables) => {
        // Cancel any outgoing refetches to avoid overwriting optimistic update
        await Promise.all(
          optimisticUpdates.map(update => 
            queryClient.cancelQueries({ queryKey: update.queryKey })
          )
        );
        
        // Snapshot previous values for rollback
        const previousValues = optimisticUpdates.map(update => ({
          queryKey: update.queryKey,
          data: queryClient.getQueryData<TData>(update.queryKey)
        }));
        
        // Apply optimistic updates
        optimisticUpdates.forEach(update => {
          const previous = queryClient.getQueryData<TData>(update.queryKey);
          queryClient.setQueryData(update.queryKey, update.updater(previous, variables));
        });
        
        // Return context for rollback
        return { previousValues } as TContext;
      },
      
      // On success, invalidate affected queries
      onSuccess: (data, variables, context) => {
        // Invalidate specified queries
        if (config.invalidateQueries) {
          Promise.all(
            config.invalidateQueries.map(queryKey => 
              queryClient.invalidateQueries({ queryKey })
            )
          );
        }
        
        // Call custom success callback if provided
        if (config.onSuccessCallback) {
          return config.onSuccessCallback(data, variables, context);
        }
      },
      
      // On error, roll back to previous values
      onError: (err, variables, context) => {
        if (context && typeof context === 'object' && 'previousValues' in context) {
          const previousValues = (context as any).previousValues;
          previousValues.forEach((value: { queryKey: unknown[], data: TData }) => {
            queryClient.setQueryData(value.queryKey, value.data);
          });
        }
        
        // Call custom error callback if provided
        if (config.onErrorCallback) {
          return config.onErrorCallback(err, variables, context);
        }
      },
      
      // Apply additional options
      ...config.options
    });
  }, [queryClient]);
  
  /**
   * Get a select function that only returns specified keys from the data
   * This reduces re-renders when unrelated parts of the data change
   * 
   * @param keys - Array of keys to select from the data
   * @returns Select function for useQuery
   */
  const getSelectFunction = useCallback(<TData extends Record<string, unknown>>(
    keys: (keyof TData)[]
  ) => {
    return (data: TData): Partial<TData> => {
      if (!data) return data;
      
      return keys.reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {} as Partial<TData>);
    };
  }, []);
  
  return {
    getQueryOptions,
    setupPrefetching,
    getOptimisticMutation,
    getSelectFunction,
  };
};

export default useQueryOptimizer; 