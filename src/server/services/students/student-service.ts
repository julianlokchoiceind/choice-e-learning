import prisma from '@/server/db/prisma-client';
import { User, Prisma } from '@prisma/client';
import { UserRole } from '@/shared/types/auth/roles';

// Type for formatted student data from User model
export type FormattedStudent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  grade: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentQueryParams = {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const studentService = {
  getAllStudents: async ({ search, isActive, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }: StudentQueryParams) => {
    const skip = (page - 1) * limit;
    
    try {
      console.log('Starting getAllStudents service function');
      
      // Get users with role 'student'
      const userWhere: Prisma.UserWhereInput = {
        role: 'student'
      };
      
      console.log('Using query criteria:', JSON.stringify(userWhere));
      
      if (search) {
        userWhere.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { grade: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Apply isActive filter if provided
      if (isActive !== undefined) {
        userWhere.isActive = isActive;
      }

      // Count total students
      const userTotal = await prisma.user.count({ where: userWhere });
      console.log(`Found ${userTotal} students with role=student`);

      if (userTotal === 0 && page === 1 && !search) {
        console.log('No student users found, consider adding students manually');
      }
      
      // Log query parameters
      console.log('Query parameters:', {
        where: userWhere,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      });
      
      // Get users with role 'student'
      const studentUsers = await prisma.user.findMany({
        where: userWhere,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      });

      console.log(`Retrieved ${studentUsers.length} student records, first few:`, 
        studentUsers.slice(0, 2).map(u => ({ id: u.id, email: u.email, role: u.role })));

      // Convert User objects to FormattedStudent objects
      const formattedStudents = studentUsers.map(user => {
        console.log(`Formatting student ${user.id} (${user.email})`);
        return {
          id: user.id,
          name: user.name || 'Unknown',
          email: user.email,
          phone: user.phone || '-',
          address: user.address || '-',
          city: user.city || '-',
          grade: user.grade || '-',
          imageUrl: user.imageUrl || null,
          isActive: user.isActive ?? true,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      });

      // Recalculate total after possibly adding sample data
      const totalCount = await prisma.user.count({ where: userWhere });

      const result = {
        data: formattedStudents,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(totalCount / limit)),
        }
      };

      console.log('Returning result:', {
        resultLength: result.data.length,
        pagination: result.meta
      });

      return result;
    } catch (error: unknown) {
      console.error('Error in getAllStudents:', error);
      throw error;
    }
  },
  
  getStudentById: async (id: string) => {
    try {
      // Find a user with role 'student'
      const user = await prisma.user.findFirst({
        where: { 
          id,
          role: 'student'
        },
      });
      
      if (!user) {
        throw new Error(`Student with ID ${id} not found`);
      }
      
      // Convert User to FormattedStudent object
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        grade: user.grade,
        imageUrl: user.imageUrl,
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error: unknown) {
      console.error(`Error in getStudentById for ID ${id}:`, error);
      throw error;
    }
  },
  
  createStudent: async (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    grade?: string;
    imageUrl?: string;
    provider?: string;
    providerId?: string;
    isActive?: boolean;
  }) => {
    try {
      // Chuẩn bị dữ liệu tạo user
      const userData: any = {
        name: data.name,
        email: data.email,
        role: 'student' as const,
        phone: data.phone,
        address: data.address,
        city: data.city,
        grade: data.grade,
        imageUrl: data.imageUrl,
        provider: data.provider,
        providerId: data.providerId,
        isActive: data.isActive ?? true,
      };
      
      // Nếu không phải tài khoản OAuth (không có provider), thêm password
      if (!data.provider) {
        userData.password = Math.random().toString(36).substring(2, 15); // Mật khẩu tạm
      }
      
      // Create a User with role 'student'
      const user = await prisma.user.create({
        data: userData,
      });
      
      // Return formatted student data
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        grade: user.grade,
        imageUrl: user.imageUrl,
        provider: user.provider,
        providerId: user.providerId,
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error: unknown) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  },
  
  updateStudent: async (id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    grade?: string;
    imageUrl?: string;
    provider?: string;
    providerId?: string;
    isActive?: boolean;
  }) => {
    try {
      // Check if this is a User with role 'student'
      const user = await prisma.user.findFirst({
        where: { 
          id,
          role: 'student'
        },
      });
      
      if (!user) {
        throw new Error(`Student with ID ${id} not found`);
      }
      
      // Dữ liệu cập nhật
      const updateData = {...data};
      
      // Nếu là tài khoản OAuth, không cho sửa provider và providerId
      if (user.provider) {
        delete updateData.provider;
        delete updateData.providerId;
      }
      
      // Update the User
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      
      // Return formatted student data
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        grade: updatedUser.grade,
        imageUrl: updatedUser.imageUrl,
        provider: updatedUser.provider,
        providerId: updatedUser.providerId,
        isActive: updatedUser.isActive ?? true,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
    } catch (error: unknown) {
      console.error(`Error in updateStudent for ID ${id}:`, error);
      throw error;
    }
  },
  
  deleteStudent: async (id: string) => {
    try {
      console.log(`Starting delete operation for student ${id}`);
      // Check if this is a User with role 'student'
      const user = await prisma.user.findFirst({
        where: { 
          id,
          role: 'student'
        },
        include: {
          // Include related data to check for connections
          reviews: true,
          submissions: true,
          achievements: true,
          progress: true,
          // Getting enrolled courses separately
          _count: {
            select: {
              enrolledIn: true
            }
          }
        }
      });
      
      if (!user) {
        throw new Error(`Student with ID ${id} not found`);
      }
      
      // Check if student has related data
      const hasRelatedData = user._count.enrolledIn > 0 ||
                           user.reviews.length > 0 ||
                           user.submissions.length > 0 ||
                           user.achievements.length > 0 ||
                           user.progress.length > 0;
      
      console.log(`Student ${id} has related data: ${hasRelatedData}`);
      console.log(`Related data counts: Courses: ${user._count.enrolledIn}, Reviews: ${user.reviews.length}, Submissions: ${user.submissions.length}, Achievements: ${user.achievements.length}, Progress: ${user.progress.length}`);
      
      if (hasRelatedData) {
        // Có dữ liệu liên quan - chỉ cập nhật role để tránh mất dữ liệu liên quan
        console.log(`Updating role to deleted_user for student ${id} instead of deleting`);
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            role: 'deleted_user',
          },
        });
        console.log(`Successfully updated student ${id} to role deleted_user`);
        return { id, success: true, method: 'role_update' };
      } else {
        // Không có dữ liệu liên quan - xóa hoàn toàn
        try {
          console.log(`Attempting to fully delete student ${id}`);
          await prisma.user.delete({
            where: { id },
          });
          console.log(`Successfully deleted student ${id} from database`);
          return { id, success: true, method: 'full_delete' };
        } catch (deleteError: unknown) {
          // Nếu không thể xóa, sử dụng phương pháp cập nhật role
          console.error(`Failed to delete student ${id}, using role update instead:`, deleteError);
          await prisma.user.update({
            where: { id },
            data: {
              role: 'deleted_user',
            },
          });
          return { id, success: true, method: 'role_update_fallback' };
        }
      }
    } catch (error: unknown) {
      console.error(`Error in deleteStudent for ID ${id}:`, error);
      throw error;
    }
  }
};

/**
 * Bulk delete students
 * @param studentIds Array of student IDs to delete
 * @returns Object with deleted and failed arrays
 */
export async function bulkDeleteStudents(studentIds: string[]): Promise<{
  deleted: string[];
  failed: { id: string; error: string }[];
}> {
  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];

  for (const studentId of studentIds) {
    try {
      await studentService.deleteStudent(studentId);
      deleted.push(studentId);
    } catch (error: unknown) {
      console.error(`Failed to delete student ${studentId}:`, error);
      failed.push({
        id: studentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { deleted, failed };
}
