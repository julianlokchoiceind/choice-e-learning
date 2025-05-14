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
    const sequence = match[1];
    const dateStr = match[2];
    
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    
    return `Draft Course #${sequence} (${day}/${month}/${year})`;
  }
  
  return title;
} 