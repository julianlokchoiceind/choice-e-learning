'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { CloudArrowUpIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Props interface for the component
interface FileUploadProps {
  currentImageUrl?: string; // For existing images when editing
  onImageUpload: (url: string) => void; // Callback for when image is uploaded
  type?: 'course-cover' | 'course-material' | 'user-avatar' | 'common'; // Upload type
  entityId?: string; // Course ID or User ID if applicable
  className?: string; // For custom styling
}

/**
 * FileUpload component that handles image uploads with preview
 */
export default function FileUpload({ 
  currentImageUrl, 
  onImageUpload, 
  type = 'course-cover',
  entityId,
  className = ''
}: FileUploadProps) {
  // Component state
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Xử lý URL của ảnh hiện tại để tránh cache
  useEffect(() => {
    if (currentImageUrl) {
      const urlWithTimestamp = `${currentImageUrl}${currentImageUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      setPreviewUrl(urlWithTimestamp);
      setImageError(false);
    } else {
      setPreviewUrl(null);
    }
  }, [currentImageUrl]);

  /**
   * Handle file change event when user selects a file
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('File type not allowed. Only JPEG, PNG, and GIF are allowed.');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds limit of 2MB');
      return;
    }

    // Create a temporary preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);

    // Upload the file
    try {
      setIsUploading(true);
      
      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      // Add entity ID if available
      if (entityId) {
        formData.append(type.includes('course') ? 'courseId' : 'userId', entityId);
      }

      // Send the upload request using axios
      const apiClient = (await import('@/client/utils/http/api-client')).default;
      
      // Special config for file upload
      const uploadConfig = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await apiClient.post('/api/upload', formData, uploadConfig);
      
      // Parse the response
      const result = response.data;
      
      // Handle upload failure
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update the image URL using the callback
      onImageUpload(result.data.url);
    } catch (err: unknown) {
      console.error('Error uploading file:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Clear the selected image
   */
  const handleClearImage = () => {
    setPreviewUrl(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Trigger the file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Hidden file input */}
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='image/jpeg,image/png,image/gif'
        onChange={handleFileChange}
      />

      {/* Image preview or upload area */}
      {previewUrl && !imageError ? (
        <div className='relative'>
          <Image src={previewUrl} 
            alt='Preview' 
            className='w-full h-48 object-cover rounded-md border border-gray-300' 
            width={500} height={300} 
            onError={() => {
              console.error('Image failed to load:', previewUrl);
              setImageError(true);
            }}
          />
          <button
            type='button'
            onClick={handleClearImage}
            className='absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700'
            aria-label='Remove image'
          >
            <XCircleIcon className='h-5 w-5' />
          </button>
        </div>
      ) : (
        <div 
          onClick={handleUploadClick}
          className='border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors'
        >
          <CloudArrowUpIcon className='h-10 w-10 text-gray-400' />
          <p className='mt-2 text-sm text-gray-500'>Click to upload or drag and drop</p>
          <p className='text-xs text-gray-400'>PNG, JPG, GIF up to 2MB</p>
        </div>
      )}

      {/* Loading and error states */}
      {isUploading && (
        <div className='mt-2 text-sm text-gray-500 flex items-center'>
          <svg className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
          </svg>
          Uploading image...
        </div>
      )}

      {error && (
        <div className='mt-2 text-sm text-red-500'>
          {error}
        </div>
      )}
    </div>
  );
}
