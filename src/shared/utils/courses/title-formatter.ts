/**
 * Formats title for user-friendly display in UI
 * @param title Original title from database
 * @param type Type of content (course, topic, faq)
 * @returns Formatted title for display
 */
export function formatTitle(title: string, type: 'course' | 'topic' | 'faq' = 'course'): string {
  if (!title) return '';
  
  // Pattern for different types
  const patterns = {
    course: /^Untitled-Course-(\d+)-(\d{8})$/,
    topic: /^Untitled-Topic-(\d+)-(\d{8})$/,
    faq: /^Untitled-FAQ-(\d+)-(\d{8})$/
  };
  
  const match = title.match(patterns[type]);
  
  if (match) {
    // Trả về đúng định dạng backend
    return title;
  }
  
  return title;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use formatTitle instead
 */
export function formatCourseTitle(title: string): string {
  return formatTitle(title, 'course');
}

/**
 * Helper to format topic title
 */
export function formatTopicTitle(title: string): string {
  return formatTitle(title, 'topic');
}

/**
 * Helper to format FAQ title
 */
export function formatFAQTitle(title: string): string {
  return formatTitle(title, 'faq');
}