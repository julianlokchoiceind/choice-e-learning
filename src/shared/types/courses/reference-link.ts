export interface ReferenceLink {
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

export interface CreateReferenceLinkRequest {
  title: string;
  url: string;
  description?: string;
  order?: number;
}

export interface UpdateReferenceLinkRequest {
  title?: string;
  url?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface ReferenceLinkFilter {
  isActive?: boolean;
  search?: string;
}

export interface ReferenceLinkListResponse {
  referenceLinks: ReferenceLink[];
  total: number;
}