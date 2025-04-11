import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supported file types for upload
 */
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Error class for file upload errors
 */
export class FileUploadError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'FileUploadError';
    this.statusCode = statusCode;
  }
}

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  size: number;
}

/**
 * Validate a file based on type and size
 * @param file The file to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSize Maximum file size in bytes
 * @throws FileUploadError if validation fails
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = [...ALLOWED_FILE_TYPES.IMAGE],
  maxSize: number = MAX_FILE_SIZE
): void {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new FileUploadError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw new FileUploadError(`File too large. Maximum size is ${maxSizeMB}MB`);
  }
}

/**
 * Generate a unique filename for upload
 * @param originalFilename The original filename
 * @returns A unique filename with the same extension
 */
export function generateUniqueFilename(originalFilename: string): string {
  const fileExtension = originalFilename.split('.').pop() || '';
  const uniqueId = uuidv4();
  return `${uniqueId}.${fileExtension}`;
}

/**
 * Extract files from a multipart form data request
 * @param req The Next.js request object
 * @returns A promise that resolves to a map of field names to files
 */
export async function extractFilesFromRequest(req: NextRequest): Promise<Map<string, File>> {
  const formData = await req.formData();
  const files = new Map<string, File>();

  // Extract files from form data
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.set(key, value);
    }
  }

  return files;
}

/**
 * Get the S3 bucket configuration from environment variables
 */
export function getS3Config() {
  const accessKey = process.env.S3_ACCESS_KEY;
  const secretKey = process.env.S3_SECRET_KEY;
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION;

  if (!accessKey || !secretKey || !bucketName || !region) {
    throw new Error('S3 configuration is incomplete. Check environment variables.');
  }

  return {
    accessKey,
    secretKey,
    bucketName,
    region,
  };
}

/**
 * Mock implementation for uploading a file to S3
 * In a real application, this would use the AWS SDK
 * @param file The file to upload
 * @param path The path within the bucket
 * @returns A promise that resolves to the URL of the uploaded file
 */
export async function uploadFileToS3(file: File, path: string = 'uploads'): Promise<string> {
  try {
    // For now, we'll just simulate an upload and return a mock URL
    const uniqueFilename = generateUniqueFilename(file.name);
    const { bucketName, region } = getS3Config();
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a mock S3 URL
    return `https://${bucketName}.s3.${region}.amazonaws.com/${path}/${uniqueFilename}`;
  } catch (error) {
    throw new FileUploadError(`Failed to upload file: ${(error as Error).message}`);
  }
} 