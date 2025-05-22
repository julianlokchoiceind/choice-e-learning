/**
 * Common hooks barrel file
 * Exports all common utility hooks for use throughout the application
 */

// API request hooks
export * from './useApiRequest';

// Toast notification hooks
export * from './useToast';

// React Query utility hooks
export * from './useQueryUtils';
export * from './useQueryOptimizer';

export { default as useQueryOptimizer } from './useQueryOptimizer'; 