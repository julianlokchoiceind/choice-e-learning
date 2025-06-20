/**
 * File upload service
 * Handles file upload operations for the application
 */

import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

// Helper function to check if file exists
const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

// Define the upload types for better type safety
export type UploadType = 'course-cover' | 'course-material' | 'lesson-material' | 'user-avatar' | 'common';

// Options interface for uploading files
interface UploadOptions {
  type: UploadType;
  courseId?: string;
  lessonId?: string;
  userId?: string;
  temporary?: boolean;
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
  const { type, courseId, lessonId, userId, temporary } = options;
  
  // Get the base upload directory
  const baseUploadDir = join(process.cwd(), 'public', 'uploads');
  
  // If temporary, use temp directory
  if (temporary) {
    const uploadDir = join(baseUploadDir, 'temp');
    await mkdir(uploadDir, { recursive: true });
    
    // Create unique filename for temp files
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFileName);
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Return the relative URL path
    const relativePath = filePath.replace(join(process.cwd(), 'public'), '');
    return relativePath.replace(/\\/g, '/');
  }
  
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
  
  // Keep original filename but handle duplicates
  const fileExtension = fileName.split('.').pop() || 'jpg';
  const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
  
  // Function to check if file exists and generate unique name
  const generateUniqueFileName = async (dir: string, name: string, ext: string): Promise<string> => {
    let finalName = `${name}.${ext}`;
    let filePath = join(dir, finalName);
    let counter = 1;
    
    // Check if file exists and increment counter if needed
    while (await exists(filePath)) {
      finalName = `${name} (${counter}).${ext}`;
      filePath = join(dir, finalName);
      counter++;
    }
    
    return finalName;
  };
  
  const uniqueFileName = await generateUniqueFileName(uploadDir, baseName, fileExtension);
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
