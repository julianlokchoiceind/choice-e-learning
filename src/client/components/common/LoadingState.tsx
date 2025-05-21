'use client';

import React from 'react';

/**
 * LoadingState component props
 * @property {string} [message] - Optional message to display with the loading indicator
 * @property {'default' | 'page' | 'table' | 'section' | 'button'} [variant='default'] - The visual variant of the loading state
 * @property {'small' | 'medium' | 'large'} [size='medium'] - Size of the loading indicator
 * @property {string} [className] - Additional CSS classes to apply
 */
export interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'page' | 'table' | 'section' | 'button';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * LoadingState Component
 * 
 * A versatile loading indicator component that supports multiple variants for different UI contexts.
 * 
 * @param {LoadingStateProps} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * // Default loading spinner
 * <LoadingState />
 * 
 * @example
 * // Full page loading
 * <LoadingState variant="page" message="Loading page..." />
 * 
 * @example
 * // Table loading
 * <LoadingState variant="table" />
 * 
 * @example
 * // Section loading
 * <LoadingState variant="section" message="Loading data..." />
 * 
 * @example
 * // Button loading
 * <LoadingState variant="button" size="small" />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  variant = 'default',
  size = 'medium',
  className = '',
}: LoadingStateProps) => {
  // Size classes for spinner variants
  const spinnerSizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  };

  // Default message based on variant if not provided
  const defaultMessages = {
    default: 'Loading...',
    page: 'Loading page...',
    table: 'Loading data...',
    section: 'Loading...',
    button: ''  // Buttons typically don't have messages
  };

  // Use provided message or default for the variant
  const displayMessage = message ?? defaultMessages[variant];
  
  // Common spinner styles using CSS variable
  const spinnerStyle = {
    borderTopColor: 'var(--spinner-color)',
  };
  
  // Render based on variant
  switch (variant) {
    case 'page':
      return (
        <div className={`fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-50 ${className}`}>
          <div 
            className={`${spinnerSizeClasses[size]} border border-blue-100 rounded-full animate-spin`}
            style={spinnerStyle}
          ></div>
          {displayMessage && (
            <p className="mt-4 text-lg font-medium text-gray-700">{displayMessage}</p>
          )}
        </div>
      );
      
    case 'table':
      return (
        <div className={`w-full flex flex-col items-center justify-center py-12 ${className}`}>
          <div 
            className={`${spinnerSizeClasses[size]} border border-gray-200 rounded-full animate-spin`}
            style={spinnerStyle}
          ></div>
          {displayMessage && (
            <p className="mt-3 text-sm text-gray-500">{displayMessage}</p>
          )}
          <div className="w-full max-w-2xl mt-4 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      );
      
    case 'section':
      return (
        <div className={`w-full h-32 flex flex-col items-center justify-center bg-gray-50 rounded-md border border-gray-200 ${className}`}>
          <div 
            className={`${spinnerSizeClasses[size]} border border-gray-200 rounded-full animate-spin`}
            style={spinnerStyle}
          ></div>
          {displayMessage && (
            <p className="mt-2 text-sm text-gray-600">{displayMessage}</p>
          )}
        </div>
      );
      
    case 'button':
      return (
        <div className={`inline-flex items-center justify-center ${className}`}>
          <div 
            className={`${spinnerSizeClasses['small']} border border-gray-200 rounded-full animate-spin`}
            style={{
              borderTopColor: 'currentColor',  // Use text color for buttons
            }}
          ></div>
          {displayMessage && (
            <span className="ml-2 text-sm">{displayMessage}</span>
          )}
        </div>
      );
      
    case 'default':
    default:
      return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
          <div 
            className={`${spinnerSizeClasses[size]} border border-gray-200 rounded-full animate-spin`}
            style={spinnerStyle}
          ></div>
          {displayMessage && (
            <p className="mt-2 text-gray-600">{displayMessage}</p>
          )}
        </div>
      );
  }
};

export default LoadingState;