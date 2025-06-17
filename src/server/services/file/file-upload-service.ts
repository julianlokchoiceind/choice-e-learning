/**
 * File upload service
 * Handles file upload operations for the application
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Define the upload types for better type safety
export type UploadType = 'course-cover' | 'course-material' | 'lesson-material' | 'user-avatar' | 'common';

// Options interface for uploading files
interface UploadOptions {
  type: UploadType;
  courseId?: string;
  lessonId?: string;
  userId?: string;
}

/**
 * Upload a file to the appropriate directory based on its type and context
 * 
 * @param file The file to upload
 * @param options Options containing type and context information
 * @returns The relative URL path to the uploaded file
 */
export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  options: UploadOptions
): Promise<string> {
  const { type, courseId, lessonId, userId } = options;
  
  // Get the base upload directory
  const baseUploadDir = join(process.cwd(), 'public', 'uploads');
  
  // Determine the specific upload directory based on file type and context
  let uploadDir = baseUploadDir;
  
  switch (type) {
    case 'course-cover':
      uploadDir = join(uploadDir, 'courses', 'covers');
      if (courseId) {
        uploadDir = join(uploadDir, courseId);
      }
      break;
    case 'course-material':
      uploadDir = join(uploadDir, 'courses', 'materials');
      if (courseId) {
        uploadDir = join(uploadDir, courseId);
      }
      break;
    case 'lesson-material':
      uploadDir = join(uploadDir, 'lessons', 'materials');
      if (lessonId) {
        uploadDir = join(uploadDir, lessonId);
      }
      break;
    case 'user-avatar':
      uploadDir = join(uploadDir, 'users');
      if (userId) {
        uploadDir = join(uploadDir, userId);
      }
      break;
    default:
      uploadDir = join(uploadDir, 'common');
  }
  
  // Ensure the upload directory exists
  await mkdir(uploadDir, { recursive: true });
  
  // Create a unique filename with timestamp to avoid conflicts
  const fileExtension = fileName.split('.').pop() || 'jpg';
  const uniqueFileName = `${type}-${Date.now()}.${fileExtension}`;
  const filePath = join(uploadDir, uniqueFileName);
  
  // Save the file
  await writeFile(filePath, buffer);
  
  // Return the relative URL path
  const relativePath = filePath.replace(join(process.cwd(), 'public'), '');
  return relativePath.replace(/\\/g, '/'); // Ensure proper URL format
}

/**
 * Check if a path is a URL or a relative path
 * 
 * @param path The path to check
 * @returns True if the path is a URL or starts with '/uploads/'
 */
export function isUrl(path: string): boolean {
  try {
    new URL(path);
    return true;
  } catch {
    return path.startsWith('/uploads/') || path.startsWith('http://') || path.startsWith('https://');
  }
}
