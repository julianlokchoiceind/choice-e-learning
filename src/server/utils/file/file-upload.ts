/**
 * File upload constants and utilities
 * Provides common file upload validation and configuration settings
 */

import { ApiErrorCode } from '@/server/api/api-error-codes';

export type FileMetadata = {
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
};

/**
 * Maximum file size (in bytes)
 * Default: 10MB
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Allowed MIME types for file uploads
 */
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ],
  audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm'],
};

/**
 * Get file extension from file name
 * @param fileName File name
 * @returns File extension (without dot)
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file size
 * @param fileSize File size in bytes
 * @param maxSize Maximum allowed size in bytes
 * @returns Object with validation result and error code if invalid
 */
export function validateFileSize(
  fileSize: number,
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; errorCode?: ApiErrorCode } {
  if (fileSize > maxSize) {
    return {
      valid: false,
      errorCode: ApiErrorCode.FILE_TOO_LARGE
    };
  }
  
  return { valid: true };
}

/**
 * Validate file type
 * @param mimeType File MIME type
 * @param allowedTypes Allowed MIME types or a specific type category
 * @returns Object with validation result and error code if invalid
 */
export function validateFileType(
  mimeType: string,
  allowedTypes: string[] | keyof typeof ALLOWED_FILE_TYPES = Object.values(ALLOWED_FILE_TYPES).flat()
): { valid: boolean; errorCode?: ApiErrorCode } {
  // If allowedTypes is a type category string, get the array of allowed types for that category
  const typesToCheck = typeof allowedTypes === 'string'
    ? ALLOWED_FILE_TYPES[allowedTypes] || []
    : allowedTypes;
  
  if (!typesToCheck.includes(mimeType)) {
    return {
      valid: false,
      errorCode: ApiErrorCode.INVALID_FILE_TYPE
    };
  }
  
  return { valid: true };
}

/**
 * Generate a unique file name to prevent collisions
 * @param originalName Original file name
 * @returns Unique file name with timestamp and random string
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const extension = getFileExtension(originalName);
  
  // Remove special characters from original name
  const sanitizedName = originalName
    .split('.')
    .slice(0, -1)
    .join('.')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .substring(0, 50);
  
  return `${sanitizedName}-${timestamp}-${randomStr}.${extension}`;
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted file size with appropriate unit
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file type category from MIME type
 * @param mimeType File MIME type
 * @returns File type category or 'unknown'
 */
export function getFileTypeCategory(mimeType: string): string {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimeType)) {
      return category;
    }
  }
  
  return 'unknown';
}
