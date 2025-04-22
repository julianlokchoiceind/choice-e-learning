import { NextRequest } from "next/server";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from "@/lib/api/api-response";
import { withAdmin } from "@/lib/api/route-handlers";
import { z } from "zod";
import { parseRequest } from "@/lib/api/request-parser";
import { studentService } from "@/lib/services/students/student-service";
import { ApiErrorCode } from "@/lib/api/api-error-codes";

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
export const GET = withAdmin(async (
  req: NextRequest,
  { params }: { params: { studentId: string } }
) => {
  try {
    const student = await studentService.getStudentById(params.studentId);
    
    if (!student) {
      return apiNotFound("Student");
    }
    
    return apiSuccess(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return apiError(
      `Student with ID ${params.studentId} not found`,
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.NOT_FOUND
    );
  }
});

// PATCH - Update a student by ID
export const PATCH = withAdmin(async (
  req: NextRequest,
  { params }: { params: { studentId: string } }
) => {
  try {
    const body = await parseRequest(req, updateStudentSchema);
    
    const updatedStudent = await studentService.updateStudent(
      params.studentId,
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
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

// DELETE - Delete a student by ID
export const DELETE = withAdmin(async (
  req: NextRequest,
  { params }: { params: { studentId: string } }
) => {
  try {
    const result = await studentService.deleteStudent(params.studentId);
    
    if (!result) {
      return apiNotFound("Student");
    }
    
    return apiSuccess({ success: true }, "Student deleted successfully");
  } catch (error) {
    console.error("Error deleting student:", error);
    
    if (error instanceof Error && error.message.includes("not found")) {
      return apiNotFound("Student");
    }
    
    return apiError(
      "Failed to delete student",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
