export interface CourseReferenceLink {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  courseId: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCourseReferenceLinkRequest {
  title: string;
  url: string;
  description?: string;
  order?: number;
}

export interface UpdateCourseReferenceLinkRequest {
  title?: string;
  url?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface CourseReferenceLinkFilter {
  isActive?: boolean;
  search?: string;
}

export interface CourseReferenceLinkListResponse {
  courseReferenceLinks: CourseReferenceLink[];
  total: number;
}