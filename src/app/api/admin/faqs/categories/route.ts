import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api/api-response";
import { withAdmin } from "@/lib/api/route-handlers";
import { faqService } from "@/lib/services/faq/faq-service";
import { ApiErrorCode } from "@/lib/api/api-error-codes";

// GET - Get all distinct FAQ categories
export const GET = withAdmin(async (req: NextRequest) => {
  try {
    const categories = await faqService.getAllCategories();
    return apiSuccess(categories);
  } catch (error) {
    console.error("Error fetching FAQ categories:", error);
    return apiError(
      "Failed to fetch FAQ categories",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
