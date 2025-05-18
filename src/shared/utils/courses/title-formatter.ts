/**
 * Formats course title for user-friendly display in UI
 * @param title Original title from database
 * @returns Formatted title for display
 */
export function formatCourseTitle(title: string): string {
  if (!title) return '';
  
  // Match "Untitled-{sequence}-{DDMMYYYY}" pattern
  const match = title.match(/^Untitled-(\d+)-(\d{8})$/);
  
  if (match) {
    // Trả về đúng định dạng backend
    return title;
  }
  
  return title;
} 