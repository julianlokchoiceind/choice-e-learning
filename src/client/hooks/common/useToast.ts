'use client';

import React from 'react';
import { useState, useCallback } from 'react';
import toast, { Toast, ToastOptions } from 'react-hot-toast';

/**
 * Custom hook that provides convenient toast notification functions.
 * Must be used within a component that is wrapped by the ToastProvider.
 * 
 * @returns An object containing functions to display various types of toast notifications.
 * 
 * @example
 * // Basic usage
 * const { success, error } = useToast();
 * 
 * // Show a success toast
 * success('Operation completed successfully');
 * 
 * // Show an error toast with custom options
 * error('Something went wrong', { duration: 5000 });
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<string[]>([]);

  /**
   * Display a success toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const success = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast.success(message, options);
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Display an error toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const error = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast.error(message, options);
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Display a warning toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const warning = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast(message, {
      ...options,
      icon: '⚠️',
      style: {
        background: '#f59e0b', // amber-500
        color: '#fff',
      },
    });
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Display an info toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const info = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast(message, {
      ...options,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6', // blue-500
        color: '#fff',
      },
    });
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Display a loading toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const loading = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast.loading(message, options);
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Display a custom toast notification.
   * 
   * @param message - The message to display in the toast.
   * @param options - Optional configuration for the toast.
   * @returns The ID of the created toast.
   */
  const custom = useCallback((message: string, options?: ToastOptions): string => {
    const id = toast(message, options);
    setToasts((prev) => [...prev, id]);
    return id;
  }, []);

  /**
   * Dismiss one or all toast notifications.
   * 
   * @param toastId - Optional ID of a specific toast to dismiss.
   *                 If not provided, all toasts will be dismissed.
   */
  const dismiss = useCallback((toastId?: string): void => {
    if (toastId) {
      toast.dismiss(toastId);
      setToasts((prev) => prev.filter((id) => id !== toastId));
    } else {
      toast.dismiss();
      setToasts([]);
    }
  }, []);

  /**
   * Update an existing toast notification with new content or options.
   * 
   * @param toastId - The ID of the toast to update.
   * @param message - The new message to display.
   * @param options - Optional new configuration for the toast.
   * @returns True if the toast was found and updated, false otherwise.
   */
  const update = useCallback((toastId: string, message: string, options?: ToastOptions): boolean => {
    if (toasts.includes(toastId)) {
      toast.loading(message, { id: toastId, ...options });
      return true;
    }
    return false;
  }, [toasts]);

  return {
    success,
    error,
    warning,
    info,
    loading,
    custom,
    dismiss,
    update,
  };
};

export default useToast; 