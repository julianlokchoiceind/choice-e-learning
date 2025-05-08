import { UserRole } from './auth/roles';

export interface Student {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  enrolledCourses?: string[];
}

export interface CreateStudentParams {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  image?: string;
}

export interface UpdateStudentParams {
  id: string;
  name?: string;
  email?: string;
  role?: UserRole;
  image?: string;
} 