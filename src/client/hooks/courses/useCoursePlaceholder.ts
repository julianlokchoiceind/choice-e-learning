import { useState } from 'react';

export const DEFAULT_COURSE_PLACEHOLDER = '/images/courses/course-placeholder.jpg';

/**
 * Hook for consistent course image placeholder handling
 * @param initialImageUrl - The initial image URL to use
 * @returns Object with image URL and error handler
 */
export const useCoursePlaceholder = (initialImageUrl?: string) => {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || DEFAULT_COURSE_PLACEHOLDER);
  
  /**
   * Error handler for image loading failures
   * @param e - The error event from the image
   */
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const imgElement = e.target as HTMLImageElement;
    if (imgElement.src !== DEFAULT_COURSE_PLACEHOLDER) {
      imgElement.src = DEFAULT_COURSE_PLACEHOLDER;
      setImageUrl(DEFAULT_COURSE_PLACEHOLDER);
    }
  };
  
  /**
   * Get a timestamped URL to prevent caching
   * @param url - The URL to add a timestamp to
   * @returns URL with timestamp query parameter
   */
  const getTimestampedUrl = (url: string): string => {
    if (!url) return DEFAULT_COURSE_PLACEHOLDER;
    
    // Don't add timestamp to the placeholder
    if (url === DEFAULT_COURSE_PLACEHOLDER) return url;
    
    const timestamp = Date.now();
    const hasQueryParams = url.includes('?');
    return `${url}${hasQueryParams ? '&' : '?'}t=${timestamp}`;
  };
  
  return {
    imageUrl: getTimestampedUrl(imageUrl),
    placeholderUrl: DEFAULT_COURSE_PLACEHOLDER,
    handleImageError,
    setImageUrl
  };
};

export default useCoursePlaceholder;
