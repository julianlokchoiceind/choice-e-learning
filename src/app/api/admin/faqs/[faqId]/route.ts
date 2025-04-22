import { NextRequest } from "next/server";
import { apiSuccess, apiError, apiValidationError, apiNotFound } from "@/lib/api/api-response";
import { withAdmin } from "@/lib/api/route-handlers";
import { z } from "zod";
import { parseRequest } from "@/lib/api/request-parser";
import { faqService } from "@/lib/services/faq/faq-service";
import { ApiErrorCode } from "@/lib/api/api-error-codes";

// Schema for updating a FAQ
const updateFAQSchema = z.object({
  question: z.string().min(1, "Question is required").optional(),
  answer: z.string().min(1, "Answer is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});

// GET - Retrieve a single FAQ by ID
export const GET = withAdmin(async (req: NextRequest, { params }: { params: { faqId: string } }) => {
  try {
    const { faqId } = params;
    
    const faq = await faqService.getFAQById(faqId);
    
    if (!faq) {
      return apiNotFound("FAQ");
    }
    
    return apiSuccess(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return apiError(
      "Failed to fetch FAQ",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

// PATCH - Update a FAQ
export const PATCH = withAdmin(async (req: NextRequest, { params }: { params: { faqId: string } }) => {
  try {
    const { faqId } = params;
    const body = await parseRequest(req, updateFAQSchema);
    
    // Check if FAQ exists
    const existingFAQ = await faqService.getFAQById(faqId);
    
    if (!existingFAQ) {
      return apiNotFound("FAQ");
    }
    
    // Update FAQ
    const updatedFAQ = await faqService.updateFAQ(faqId, body);
    
    return apiSuccess(updatedFAQ, "FAQ updated successfully");
  } catch (error) {
    console.error("Error updating FAQ:", error);
    if (error instanceof z.ZodError) {
      return apiValidationError(error);
    }
    
    return apiError(
      "Failed to update FAQ",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});

// DELETE - Delete a FAQ
export const DELETE = withAdmin(async (req: NextRequest, { params }: { params: { faqId: string } }) => {
  try {
    const { faqId } = params;
    
    // Check if FAQ exists
    const existingFAQ = await faqService.getFAQById(faqId);
    
    if (!existingFAQ) {
      return apiNotFound("FAQ");
    }
    
    // Delete FAQ
    await faqService.deleteFAQ(faqId);
    
    return apiSuccess({ success: true }, "FAQ deleted successfully");
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return apiError(
      "Failed to delete FAQ",
      error instanceof Error ? error.message : undefined,
      ApiErrorCode.INTERNAL_SERVER_ERROR
    );
  }
});
