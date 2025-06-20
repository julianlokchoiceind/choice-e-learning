/**
 * Lesson Resource Types
 */
export type LessonResourceType = 'file' | 'link';

export interface LessonResourceFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string; // MIME type
  uploadedAt: Date;
}

export interface LessonResourceLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  order: number;
}

export interface LessonResources {
  files: LessonResourceFile[];
  links: LessonResourceLink[];
}

/**
 * Props for LessonResourcesSection component
 */
export interface LessonResourcesSectionProps {
  lessonId: string;
  courseId: string;
  initialResources?: LessonResources;
  allowDownload?: boolean; // From course settings
  onResourcesChange?: (resources: LessonResources) => void;
  onChangesDetected?: (hasChanges: boolean) => void;
}