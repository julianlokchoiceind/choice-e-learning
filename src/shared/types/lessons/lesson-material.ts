/**
 * Lesson material type definitions
 * Interfaces for lesson materials, file uploads, and material management
 */

/**
 * Lesson material interface
 */
export interface LessonMaterial {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string; // "pdf", "zip", "xls", etc
  mimeType: string; // "application/pdf", etc
  description?: string; // "Study Guide", "Source Code", etc
  url: string; // File path
  lessonId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create lesson material data
 */
export interface CreateLessonMaterialData {
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  description?: string;
  url: string;
}

/**
 * Update lesson material data
 */
export interface UpdateLessonMaterialData {
  title?: string;
  description?: string;
  order?: number;
}

/**
 * Lesson material with upload metadata (for UI display)
 */
export interface LessonMaterialWithMetadata extends LessonMaterial {
  formattedSize: string; // "2.3 MB", "1.5 KB"
  uploadedDate: string; // Formatted date
  downloadUrl: string; // Full download URL
}

/**
 * Lesson material filter
 */
export interface LessonMaterialFilter {
  lessonId: string;
  fileType?: string;
  search?: string;
  isActive?: boolean;
}

/**
 * Lesson material upload response
 */
export interface LessonMaterialUploadResponse {
  success: boolean;
  data?: LessonMaterial;
  error?: string;
}