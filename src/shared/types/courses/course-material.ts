/**
 * Course material type definitions
 * Interfaces for course materials, file uploads, and material management
 */

/**
 * Course material interface
 */
export interface CourseMaterial {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string; // "pdf", "zip", "xls", etc
  mimeType: string; // "application/pdf", etc
  description?: string; // "Study Guide", "Source Code", etc
  url: string; // File path
  courseId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create course material data
 */
export interface CreateCourseMaterialData {
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  description?: string;
  url: string;
}

/**
 * Update course material data
 */
export interface UpdateCourseMaterialData {
  title?: string;
  description?: string;
  order?: number;
}

/**
 * Course material with upload metadata (for UI display)
 */
export interface CourseMaterialWithMetadata extends CourseMaterial {
  formattedSize: string; // "2.3 MB", "1.5 KB"
  uploadedDate: string; // Formatted date
  downloadUrl: string; // Full download URL
}

/**
 * Course material filter
 */
export interface CourseMaterialFilter {
  courseId: string;
  fileType?: string;
  search?: string;
  isActive?: boolean;
}

/**
 * Course material upload response
 */
export interface CourseMaterialUploadResponse {
  success: boolean;
  data?: CourseMaterial;
  error?: string;
}