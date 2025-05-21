'use client';

import React from 'react';
import { Toaster, ToasterProps, ToastPosition } from 'react-hot-toast';

/**
 * Props for ToastProvider component
 * @property {React.ReactNode} children - Child components to be wrapped by the provider
 * @property {Partial<ToasterProps>} [toasterProps] - Optional custom props to override default Toaster configuration
 */
export interface ToastProviderProps {
  children: React.ReactNode;
  toasterProps?: Partial<ToasterProps>;
}

/**
 * ToastProvider Component
 * 
 * Provides toast notification functionality throughout the application using react-hot-toast.
 * Configures default toast styling and behavior as specified in PRD section 3.4.
 * 
 * @param {ToastProviderProps} props - Component props
 * @returns {JSX.Element} The provider component
 * 
 * @example
 * // Basic usage in app layout or component tree
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * 
 * @example
 * // With custom toaster props
 * <ToastProvider toasterProps={{ position: 'bottom-center' }}>
 *   <App />
 * </ToastProvider>
 * 
 * @example
 * // Usage in other components after ToastProvider is mounted
 * import toast from 'react-hot-toast';
 * 
 * // Show success toast
 * toast.success('Operation completed successfully');
 * 
 * // Show error toast
 * toast.error('An error occurred');
 * 
 * // Show loading toast
 * toast.loading('Processing...');
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  toasterProps
}) => {
  // Default configuration according to PRD section 3.4
  const defaultOptions: Partial<ToasterProps> = {
    position: 'top-right' as ToastPosition,
    toastOptions: {
      // Default toast settings
      duration: 3000,
      style: {
        background: '#363636',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '6px',
        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
        fontSize: '14px',
      },
      // Success toast variant
      success: {
        duration: 3000,
        style: {
          background: '#4ade80', // green-500
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#4ade80',
        },
      },
      // Error toast variant
      error: {
        duration: 4000,
        style: {
          background: '#ef4444', // red-500
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#ef4444',
        },
      },
      // Info toast variant (added as per PRD 3.4)
      custom: {
        duration: 3000,
        style: {
          background: '#3b82f6', // blue-500
          color: '#fff',
        },
      },
    },
  };

  return (
    <>
      {children}
      <Toaster {...defaultOptions} {...toasterProps} />
    </>
  );
};

// Export as both named and default export
export default ToastProvider; 