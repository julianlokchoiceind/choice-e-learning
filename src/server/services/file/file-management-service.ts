/**
 * File management service
 * Handles file operations including moving files from temp to permanent storage
 */

import { rename, unlink, access, mkdir, readdir } from 'fs/promises';
import { join, basename } from 'path';

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize title for use as folder name
 * @param title The original title
 * @returns Sanitized title safe for folder names
 */
function sanitizeTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return 'untitled';
  }
  
  return title
    .trim()
    .replace(/[/\\:*?"<>|]/g, '') // Remove invalid characters for folder names
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/\.+/g, '.') // Replace multiple dots with single dot
    .substring(0, 100) // Limit length to 100 characters
    .toLowerCase() || 'untitled'; // Fallback if empty
}

/**
 * Move a file from temp storage to permanent storage
 * @param tempUrl The temporary file URL (e.g., /uploads/temp/temp-123456.pdf)
 * @param destinationType The destination type (course-material, lesson-material, etc.)
 * @param entityTitle The entity title (course title or lesson title)
 * @param originalFileName The original filename from upload (e.g., document.pdf)
 * @returns The new permanent URL
 */
export async function moveTempFileToPermanent(
  tempUrl: string,
  destinationType: 'course-material' | 'lesson-material',
  entityTitle: string,
  originalFileName: string
): Promise<string> {
  try {
    // Validate that the file is in temp directory
    if (!tempUrl.includes('/uploads/temp/')) {
      // File is already permanent, return as is
      console.log(`File already permanent, returning: ${tempUrl}`);
      return tempUrl;
    }

    // Get the absolute paths
    const publicDir = join(process.cwd(), 'public');
    const tempPath = join(publicDir, tempUrl);

    // Check if temp file exists - with better error handling
    if (!(await fileExists(tempPath))) {
      console.error(`Temp file not found: ${tempPath} - This may occur if file was manually deleted or cleanup ran`);
      
      // CRITICAL: Do NOT fallback to temp URL - this should fail
      // DB should never contain temp file URLs
      throw new Error(`Temporary file not found: ${tempPath}. Cannot proceed without valid file.`);
    }

    // Sanitize the entity title for folder name
    const sanitizedTitle = sanitizeTitle(entityTitle);
    
    // Determine destination directory based on type
    let destDir: string;
    switch (destinationType) {
      case 'course-material':
        destDir = join(publicDir, 'uploads', 'courses', 'materials', sanitizedTitle);
        break;
      case 'lesson-material':
        destDir = join(publicDir, 'uploads', 'lessons', 'materials', sanitizedTitle);
        break;
      default:
        console.error(`Unknown destination type: ${destinationType}`);
        // CRITICAL: Throw error instead of returning temp URL
        throw new Error(`Unknown destination type: ${destinationType}`);
    }

    // Ensure destination directory exists - with error handling
    try {
      await mkdir(destDir, { recursive: true });
      console.log(`Created/verified destination directory: ${destDir}`);
    } catch (dirError) {
      console.error(`Failed to create destination directory: ${destDir}`, dirError);
      // CRITICAL: Throw error if directory creation fails
      throw new Error(`Failed to create destination directory: ${destDir}. Error: ${dirError}`);
    }

    // Use the provided original filename
    const cleanFilename = originalFileName || 'untitled-file.txt';
    
    // Create destination path
    const destPath = join(destDir, cleanFilename);

    // Check if destination file already exists and generate unique name if needed
    let finalDestPath = destPath;
    let counter = 1;
    try {
      while (await fileExists(finalDestPath)) {
        const ext = cleanFilename.lastIndexOf('.');
        const name = cleanFilename.substring(0, ext);
        const extension = cleanFilename.substring(ext);
        finalDestPath = join(destDir, `${name} (${counter})${extension}`);
        counter++;
      }
    } catch (checkError) {
      console.error('Error checking file existence, using original path:', checkError);
      finalDestPath = destPath;
    }

    // Move the file - with comprehensive error handling
    try {
      await rename(tempPath, finalDestPath);
      console.log(`Successfully moved file: ${tempPath} -> ${finalDestPath}`);
      
      // Return the new URL path
      const newUrl = finalDestPath.replace(publicDir, '').replace(/\\/g, '/');
      console.log(`Generated permanent URL: ${newUrl}`);
      return newUrl;
    } catch (moveError) {
      console.error(`Failed to move file from ${tempPath} to ${finalDestPath}:`, moveError);
      
      // CRITICAL: Throw error if file move fails
      // DB should never contain temp URLs
      throw new Error(`Failed to move file from ${tempPath} to ${finalDestPath}. Error: ${moveError}`);
    }
  } catch (error) {
    console.error('Unexpected error in moveTempFileToPermanent:', error);
    
    // CRITICAL: Re-throw the error - do not return temp URL
    // DB should never contain temp file URLs
    throw error;
  }
}

/**
 * Clean up orphaned temp files older than specified hours
 * @param hoursOld Files older than this will be deleted (default: 24 hours)
 * @returns Number of files cleaned up
 */
export async function cleanupOldTempFiles(hoursOld: number = 24): Promise<number> {
  try {
    const tempDir = join(process.cwd(), 'public', 'uploads', 'temp');
    
    // Check if temp directory exists
    if (!(await fileExists(tempDir))) {
      return 0;
    }

    const files = await readdir(tempDir);
    const now = Date.now();
    const maxAge = hoursOld * 60 * 60 * 1000; // Convert hours to milliseconds
    let cleanedCount = 0;

    for (const file of files) {
      // Skip if not a temp file
      if (!file.startsWith('temp-')) {
        continue;
      }

      const filePath = join(tempDir, file);
      
      try {
        // Extract timestamp from filename (temp-TIMESTAMP-random.ext)
        const timestampMatch = file.match(/temp-(\d+)-/);
        if (timestampMatch) {
          const fileTimestamp = parseInt(timestampMatch[1], 10);
          const fileAge = now - fileTimestamp;

          if (fileAge > maxAge) {
            await unlink(filePath);
            cleanedCount++;
            console.log(`Cleaned up old temp file: ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error processing temp file ${file}:`, error);
      }
    }

    return cleanedCount;
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    return 0;
  }
}

/**
 * Delete a file by URL
 * @param fileUrl The file URL to delete
 * @returns true if deleted, false otherwise
 */
export async function deleteFileByUrl(fileUrl: string): Promise<boolean> {
  try {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) {
      return false;
    }

    const filePath = join(process.cwd(), 'public', fileUrl);
    
    if (await fileExists(filePath)) {
      await unlink(filePath);
      console.log(`Deleted file: ${fileUrl}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error deleting file ${fileUrl}:`, error);
    return false;
  }
}

/**
 * Batch move temp files to permanent storage
 * @param tempUrls Array of temp file URLs
 * @param originalFileNames Array of original filenames corresponding to temp URLs
 * @param destinationType The destination type
 * @param entityTitle The entity title
 * @returns Array of new permanent URLs
 */
export async function batchMoveTempFiles(
  tempUrls: string[],
  originalFileNames: string[],
  destinationType: 'course-material' | 'lesson-material',
  entityTitle: string
): Promise<string[]> {
  const movedUrls: string[] = [];

  for (let i = 0; i < tempUrls.length; i++) {
    const tempUrl = tempUrls[i];
    const originalFileName = originalFileNames[i] || 'untitled-file.txt';
    
    try {
      const permanentUrl = await moveTempFileToPermanent(tempUrl, destinationType, entityTitle, originalFileName);
      movedUrls.push(permanentUrl);
    } catch (error) {
      console.error(`Failed to move temp file ${tempUrl}:`, error);
      // Continue with other files even if one fails
      movedUrls.push(tempUrl); // Keep original URL if move fails
    }
  }

  return movedUrls;
}