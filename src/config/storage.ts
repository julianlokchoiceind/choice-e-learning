/**
 * Storage configuration for the application
 * This file contains environment-specific storage configuration settings
 */

import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/file-upload';

const storageConfig = {
  /**
   * AWS S3 credentials
   */
  s3: {
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
    region: process.env.S3_REGION,
  },

  /**
   * File size limits
   */
  limits: {
    /**
     * Maximum image file size (in bytes)
     */
    imageSize: 5 * 1024 * 1024, // 5MB
    
    /**
     * Maximum video file size (in bytes)
     */
    videoSize: 100 * 1024 * 1024, // 100MB
    
    /**
     * Maximum document file size (in bytes)
     */
    documentSize: 10 * 1024 * 1024, // 10MB
    
    /**
     * Default maximum file size (in bytes)
     */
    defaultSize: MAX_FILE_SIZE,
  },

  /**
   * Allowed file types
   */
  allowedTypes: ALLOWED_FILE_TYPES,

  /**
   * Upload paths
   */
  paths: {
    /**
     * Base path for profile image uploads
     */
    profileImages: 'profiles',
    
    /**
     * Base path for course image uploads
     */
    courseImages: 'courses/images',
    
    /**
     * Base path for course video uploads
     */
    courseVideos: 'courses/videos',
    
    /**
     * Base path for lesson material uploads
     */
    lessonMaterials: 'lessons/materials',
    
    /**
     * Base path for challenge uploads
     */
    challengeFiles: 'challenges',
  },

  /**
   * Cloud storage provider - 's3' for AWS S3, 'local' for local storage
   */
  provider: 's3',
};

export default storageConfig; 