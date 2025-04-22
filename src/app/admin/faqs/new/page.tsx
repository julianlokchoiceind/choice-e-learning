"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFAQs } from "@/client/hooks/faq/useFAQs";
import { ArrowLeftIcon, DocumentPlusIcon as SaveIcon } from "@heroicons/react/24/outline";

export default function NewFAQPage() {
  const router = useRouter();
  const { createFAQ, fetchCategories, categories, loading, error } = useFAQs(true);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    newCategory: "", // For custom category input
  });

  const [useNewCategory, setUseNewCategory] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch existing categories on initial load
    fetchCategories();
  }, [fetchCategories]);

  const validate = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.question.trim()) {
      errors.question = "Question is required";
    }
    
    if (!formData.answer.trim()) {
      errors.answer = "Answer is required";
    }
    
    if (useNewCategory) {
      if (!formData.newCategory.trim()) {
        errors.newCategory = "Category name is required";
      }
    } else if (!formData.category) {
      errors.category = "Please select a category";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      // Use either existing category or new category
      const categoryToUse = useNewCategory ? formData.newCategory : formData.category;
      
      await createFAQ({
        question: formData.question,
        answer: formData.answer,
        category: categoryToUse,
      });
      
      // Redirect to FAQ list page on success
      router.push("/admin/faqs");
    } catch (err) {
      console.error("Error creating FAQ:", err);
      setSubmitError(
        "Failed to create FAQ. Please check your inputs and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <Link
          href="/admin/faqs"
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Create New FAQ</h1>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {submitError}
        </div>
      )}

      {/* FAQ form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Question field */}
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="question"
              name="question"
              value={formData.question}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${
                formErrors.question ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter the question"
            />
            {formErrors.question && (
              <p className="mt-1 text-sm text-red-500">{formErrors.question}</p>
            )}
          </div>

          {/* Answer field */}
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
              Answer <span className="text-red-500">*</span>
            </label>
            <textarea
              id="answer"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              rows={6}
              className={`w-full p-3 border rounded-lg ${
                formErrors.answer ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter the answer"
            ></textarea>
            {formErrors.answer && (
              <p className="mt-1 text-sm text-red-500">{formErrors.answer}</p>
            )}
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="useNewCategory"
                checked={useNewCategory}
                onChange={() => setUseNewCategory(!useNewCategory)}
                className="mr-2"
              />
              <label htmlFor="useNewCategory" className="text-sm text-gray-600">
                Create new category
              </label>
            </div>

            {useNewCategory ? (
              <div>
                <input
                  type="text"
                  id="newCategory"
                  name="newCategory"
                  value={formData.newCategory}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.newCategory ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter new category name"
                />
                {formErrors.newCategory && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.newCategory}</p>
                )}
              </div>
            ) : (
              <div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg ${
                    formErrors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/admin/faqs"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-lg flex items-center ${
              submitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {submitting ? (
              <>
                <span className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                Creating...
              </>
            ) : (
              <>
                <SaveIcon className="w-5 h-5 mr-2" />
                Create FAQ
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
