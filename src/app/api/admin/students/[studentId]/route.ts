import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from '@/server/api/api-response";
import { withAdmin, AuthenticatedContext } from '@/server/api/route-handlers";
import { z } from "zod";
import { parseRequest } from '@/server/api/request-parser";
import { studentService } from '@/server/services/students/student-service";
import { ApiErrorCode } from '@/server/api/api-error-codes";

// Schema for updating a student
const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  grade: z.string().optional(),
  imageUrl: z.string().optional(),
});

// GET - Retrieve a specific student by ID
export const GET = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  const studentId = context.params.studentId;
  if (!studentId) {
    return apiError(
      "Missing student ID",
      "Student ID is required in the URL path",
      ApiErrorCode.VALIDATION_ERROR
    );
  }
  try {
    console.log(`API: Fetching student with ID ${studentId}`);
    
    // Validate ID format to prevent database errors
    if (!/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.error(`Invalid student ID format: ${studentId}`);
      return apiError(
        "Invalid student ID format",
        "Student ID must be a valid MongoDB ObjectId",
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    const student = await studentService.getStudentById(studentId);
    
    if (!student) {
      console.log(`Student with ID ${studentId} not found`);
      return apiNotFound("Student");
    }
    
    console.log(`Successfully retrieved student: ${student.name} (${student.email})`);
    return apiSuccess(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return apiError(
      `Failed to fetch student data`,
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
});

// PATCH - Update a student by ID
export const PATCH = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  const studentId = context.params.studentId;
  if (!studentId) {
    return apiError(
      "Missing student ID",
      "Student ID is required in the URL path",
      ApiErrorCode.VALIDATION_ERROR
    );
  }
  try {
    const body = await parseRequest(req, updateStudentSchema);
    
    const updatedStudent = await studentService.updateStudent(
      studentId,
      body
    );
    
    return apiSuccess(updatedStudent, "Student updated successfully");
  } catch (error) {
    console.error("Error updating student:", error);
    
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }
    
    if (error instanceof Error && error.message.includes("not found")) {
      return apiNotFound("Student");
    }
    
    return apiError(
      "Failed to update student",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
});

// DELETE - Delete a student by ID
export const DELETE = withAdmin(async (req: NextRequest, context: AuthenticatedContext) => {
  const studentId = context.params.studentId;
  if (!studentId) {
    return apiError(
      "Missing student ID",
      "Student ID is required in the URL path",
      ApiErrorCode.VALIDATION_ERROR
    );
  }
  try {
    console.log(`API: Attempting to delete student with ID ${studentId}`);
    
    // Validate ID format
    if (!/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.error(`Invalid student ID format: ${studentId}`);
      return apiError(
        "Invalid student ID format",
        "Student ID must be a valid MongoDB ObjectId",
        ApiErrorCode.VALIDATION_ERROR
      );
    }
    
    // First check if student exists
    try {
      const student = await studentService.getStudentById(studentId);
      if (!student) {
        console.log(`Student with ID ${studentId} not found during delete operation`);
        return apiNotFound("Student");
      }
    } catch (checkError) {
      // If we can't even check if the student exists, proceed with delete attempt anyway
      console.warn(`Could not verify student existence before delete: ${checkError}`);
    }
    
    // Proceed with deletion
    const result = await studentService.deleteStudent(studentId);
    
    if (!result) {
      return apiNotFound("Student");
    }
    
    console.log(`Successfully processed deletion request for student ${studentId}`);
    console.log(`Deletion result:`, result);
    
    let successMessage = "Student deleted successfully";
    if (result.method === "role_update" || result.method === "role_update_fallback") {
      successMessage = "Student marked as deleted";
    }
    
    return apiSuccess({ 
      success: true, 
      method: result.method || "unknown"
    }, successMessage);
  } catch (error) {
    console.error("Error deleting student:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return apiNotFound("Student");
    }
    
    return apiError(
      "Failed to delete student",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.SERVER_ERROR
    );
  }
});
