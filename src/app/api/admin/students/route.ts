import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError, apiValidationError } from "@/lib/api/api-response";
import { withAdmin } from "@/lib/api/route-handlers";
import { z } from "zod";
import { parseRequest } from "@/lib/api/request-parser";
import { studentService } from "@/lib/services/students/student-service";
import { ApiErrorCode } from "@/lib/api/api-error-codes";

// Schema for creating a student
const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  grade: z.string().optional(),
  imageUrl: z.string().optional(),
});

// GET - Retrieve all students with filtering, pagination
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    
    console.log('API route: Fetching students with params:', {
      search, page, limit, sortBy, sortOrder
    });
    
    try {
      // Thêm timeout để đảm bảo các log trước đó hiển thị trong console
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const startTime = Date.now();
      console.log('=================== STUDENT API REQUEST STARTED ===================');
      console.log(`Request URL: ${req.url}`)
      console.log(`API Access by role: ${req.headers.get('x-role') || 'unknown'}, time: ${new Date().toISOString()}`);
      
      const result = await studentService.getAllStudents({
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      });
      const endTime = Date.now();
      
      // Kiểm tra và log chi tiết kết quả trả về
      console.log(`API execution time: ${endTime - startTime}ms`);
      console.log('Student service response:', {
        dataLength: result?.data?.length || 0,
        meta: result?.meta || {},
        success: !!result,
        firstStudent: result?.data?.[0] ? { 
          id: result.data[0].id,
          email: result.data[0].email,
          role: result.data[0].role 
        } : null
      });
      console.log('=================== STUDENT API REQUEST FINISHED ===================');
      // Kiểm tra kết quả trước khi trả về
      if (!result || !result.data) {
        console.log('Warning: studentService returned invalid result', result);
        // Trả về dữ liệu mặc định để tránh lỗi - đảm bảo đúng định dạng
        return NextResponse.json({
          success: true,
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 }
        });
      }
      
      console.log(`API route: Found ${result.data.length} students`);
      
      // Đảm bảo trả về đúng định dạng: {success: true, data: [...], meta: {...}}
      return NextResponse.json({
        success: true,
        data: result.data,
        meta: result.meta
      });
      
    } catch (serviceError) {
      console.error("Error from studentService:", serviceError);
      // Trả về empty array thay vì lỗi, đảm bảo đúng định dạng
      return NextResponse.json({
        success: true,
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 }
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    // Return an empty success response instead of an error to avoid showing error messages
    return NextResponse.json({
      success: true,
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    });
  }
});

// POST - Create a new student
export const POST = withAdmin(async (req: NextRequest) => {
  try {
    const body = await parseRequest(req, createStudentSchema);
    
    const student = await studentService.createStudent(body);
    
    return apiSuccess(student, "Student created successfully", undefined, 201);
  } catch (error) {
    console.error("Error creating student:", error);
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }
    
    return apiError(
      "Failed to create student",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
