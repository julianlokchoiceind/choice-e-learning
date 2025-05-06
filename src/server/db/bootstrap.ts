"use server";

import prisma from "./prisma-client";
import { Role } from '@/shared/types/auth/roles';

/**
 * Kiểm tra và tạo dữ liệu học viên mẫu nếu cần
 * Hàm này sẽ chạy tự động khi ứng dụng khởi động
 */
export async function bootstrapStudentData() {
  try {
    console.log("Checking for student data in the database...");
    
    // Đếm số lượng học viên
    const studentCount = await prisma.user.count({
      where: { role: "student" }
    });
    
    console.log(`Found ${studentCount} students in the database.`);
    
    // Nếu không có học viên nào, tạo dữ liệu mẫu
    if (studentCount === 0) {
      console.log("No students found. Creating sample student data...");
      
      const sampleStudents = [
        {
          name: "Nguyen Van A",
          email: "student1@example.com",
          password: "hashed_password_123", // Should be hashed in production
          role: "student" as Role,
          phone: "0901234567",
          city: "Ho Chi Minh",
          grade: "12"
        },
        {
          name: "Tran Thi B",
          email: "student2@example.com",
          password: "hashed_password_123", // Should be hashed in production
          role: "student" as Role,
          phone: "0909876543",
          city: "Ha Noi",
          grade: "11"
        },
        {
          name: "Le Van C",
          email: "student3@example.com",
          password: "hashed_password_123", // Should be hashed in production
          role: "student" as Role,
          phone: "0907654321",
          city: "Da Nang",
          grade: "10"
        }
      ];
      
      // Thêm học viên mẫu vào database
      for (const student of sampleStudents) {
        // Kiểm tra xem học viên đã tồn tại chưa
        const existingUser = await prisma.user.findUnique({
          where: { email: student.email }
        });
        
        if (!existingUser) {
          await prisma.user.create({
            data: student
          });
          console.log(`Created student: ${student.name} (${student.email})`);
        } else {
          console.log(`Student already exists: ${student.email}`);
        }
      }
      
      console.log("Sample student data created successfully.");
    }
    
    // Trả về true nếu thành công
    return { success: true };
  } catch (error) {
    console.error("Error bootstrapping student data:", error);
    return { success: false, error };
  }
}

// Chạy hàm này khi server khởi động
export async function initializeDatabase() {
  try {
    // Kiểm tra kết nối database
    await prisma.$connect();
    console.log("Database connection established successfully.");
    
    // Bootstrap dữ liệu học viên
    await bootstrapStudentData();
    
    // Thêm các bootstrap khác nếu cần
    
    console.log("Database initialization completed successfully.");
    return { success: true };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error };
  }
}
