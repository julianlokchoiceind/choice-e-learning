'use client';

import React from 'react';

/**
 * LoadingState component props
 * @property {string} [message] - Optional message to display with the loading indicator
 * @property {'default' | 'page' | 'table' | 'section' | 'button'} [variant='default'] - The visual variant of the loading state
 * @property {'small' | 'medium' | 'large'} [size='medium'] - Size of the loading indicator
 * @property {string} [className] - Additional CSS classes to apply
 * @property {number} [columns] - Number of columns for table skeleton
 * @property {number} [rows] - Number of rows for table skeleton
 * @property {string[]} [columnWidths] - Relative widths for each column
 * @property {number} [headerHeight] - Header height in pixels
 * @property {boolean} [showHeader] - Whether to show header skeleton
 */
export interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'page' | 'table' | 'section' | 'button';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  columns?: number;
  rows?: number;
  columnWidths?: string[];
  headerHeight?: number;
  showHeader?: boolean;
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
 * // Table loading with custom columns
 * <LoadingState variant="table" columns={5} rows={8} />
 * 
 * @example
 * // Section loading
 * <LoadingState variant="section" message="Loading data..." />
 * 
 * @example
 * // Button loading
 * <LoadingState variant="button" size="small" />
 */
export const LoadingState: React.FC<LoadingStateProps> = React.memo(({ 
  message, 
  variant = 'default',
  size = 'medium',
  className = '',
  columns = 5,
  rows = 5,
  columnWidths,
  headerHeight = 16,
  showHeader = true,
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

  // Generate default column widths if not provided
  const defaultColumnWidths = React.useMemo(() => {
    if (columnWidths && columnWidths.length === columns) {
      return columnWidths;
    }
    // Generate equal widths for all columns
    return Array.from({ length: columns }, () => `${100 / columns}%`);
  }, [columns, columnWidths]);

  // Generate skeleton rows
  const skeletonRows = React.useMemo(() => {
    return Array.from({ length: rows }, (_, rowIndex) => (
      <tr key={rowIndex} className="border-b border-gray-100">
        {Array.from({ length: columns }, (_, colIndex) => {
          // Vary skeleton content based on column position for realism
          const isFirstColumn = colIndex === 0;
          const isLastColumn = colIndex === columns - 1;
          const isMiddleColumn = !isFirstColumn && !isLastColumn;
          
          return (
            <td 
              key={colIndex} 
              className="px-6 py-4"
              style={{ width: defaultColumnWidths[colIndex] }}
            >
              <div className="flex items-center space-x-3">
                {isFirstColumn && (
                  <>
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 max-w-32"></div>
                  </>
                )}
                {isMiddleColumn && (
                  <div className={`h-4 bg-gray-200 rounded animate-pulse ${
                    colIndex % 2 === 0 ? 'w-20' : 'w-16'
                  }`}></div>
                )}
                {isLastColumn && (
                  <div className="flex justify-end space-x-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                )}
              </div>
            </td>
          );
        })}
      </tr>
    ));
  }, [rows, columns, defaultColumnWidths]);
  
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
        <div className={`w-full ${className}`}>
          <div className="w-full flex flex-col items-center justify-center py-8">
            <div 
              className={`${spinnerSizeClasses[size]} border border-gray-200 rounded-full animate-spin mb-4`}
              style={spinnerStyle}
            ></div>
            {displayMessage && (
              <p className="text-sm text-gray-500 mb-6">{displayMessage}</p>
            )}
          </div>
          
          <div className="w-full overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              {showHeader && (
                <thead className="bg-gray-50">
                  <tr>
                    {Array.from({ length: columns }, (_, index) => (
                      <th 
                        key={index} 
                        className="px-6 py-4"
                        style={{ width: defaultColumnWidths[index] }}
                      >
                        <div 
                          className="bg-gray-300 rounded animate-pulse"
                          style={{ height: `${headerHeight}px` }}
                        ></div>
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="bg-white divide-y divide-gray-200">
                {skeletonRows}
              </tbody>
            </table>
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
});

LoadingState.displayName = 'LoadingState';

export default LoadingState;