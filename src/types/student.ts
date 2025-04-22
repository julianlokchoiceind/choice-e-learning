import { User } from "@prisma/client";

// This represents a User with role "student" with only the fields needed for student management
export interface FormattedStudent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  grade: string | null;
  imageUrl: string | null;
  provider?: string | null;
  providerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type StudentWithRelations = FormattedStudent;

export interface StudentQuery {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedStudentsResponse {
  data: FormattedStudent[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateStudentDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string; 
  grade?: string;
  imageUrl?: string;
}

export interface UpdateStudentDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  grade?: string;
  imageUrl?: string;
}
