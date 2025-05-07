'use client';

import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingState = ({ 
  message = 'Đang tải...', 
  size = 'medium' 
}: LoadingStateProps) => {
  // Xác định kích thước
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4'
  };

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <div 
        className={`${sizeClasses[size]} border-t-blue-500 border-gray-200 rounded-full animate-spin`}
      ></div>
      {message && (
        <p className='mt-2 text-gray-600'>{message}</p>
      )}
    </div>
  );
};

export default LoadingState;