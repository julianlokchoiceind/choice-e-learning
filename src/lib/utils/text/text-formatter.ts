/**
 * Utilities for text formatting and processing
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text The text to slugify
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

/**
 * Truncate text to a specified length with an ellipsis
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @param suffix The suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncate(
  text: string,
  maxLength: number = 100,
  suffix: string = '...'
): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + suffix;
}

/**
 * Format a date into a human-readable string
 * @param date The date to format
 * @param format The format style ('short', 'medium', 'long', 'relative')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string {
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${diffYear}y ago`;
  }
  
  const options: Intl.DateTimeFormatOptions = 
    format === 'short' ? { month: 'short', day: 'numeric', year: 'numeric' } :
    format === 'medium' ? { month: 'long', day: 'numeric', year: 'numeric' } :
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Capitalize the first letter of a string
 * @param text The input string
 * @returns String with first letter capitalized
 */
export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Remove HTML tags from a string
 * @param html HTML string to sanitize
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}
