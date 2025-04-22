import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/api-response";
import { faqService } from "@/lib/services/faq/faq-service";
import { ApiErrorCode } from "@/lib/api/api-error-codes";

// GET - Retrieve public FAQs with filtering, pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    
    const result = await faqService.getAllFAQs({
      search,
      category,
      page,
      limit,
      sortBy,
      sortOrder,
    });
    
    return apiSuccess(result);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return apiError(
      "Failed to fetch FAQs",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
}
