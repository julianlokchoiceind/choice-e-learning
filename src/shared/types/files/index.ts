/**
 * @file File type definitions
 * @description Type definitions for file uploads and operations
 */

/**
 * File upload response interface
 */
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
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
 * S3 configuration interface
 */
export interface S3Config {
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
}

/**
 * Allowed file types by category
 */
export interface AllowedFileTypes {
  IMAGE: string[];
  VIDEO: string[];
  DOCUMENT: string[];
}
