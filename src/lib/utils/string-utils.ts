/**
 * String utility functions
 */

/**
 * Convert a string to a URL-friendly slug
 * @param text The string to convert to a slug
 * @returns The slugified string
 */
export function slugify(text: string): string {
  if (!text) return '';
  
  try {
    const slugged = text
      .toString()
      .normalize('NFD')                 // Split accented characters into base char and accent
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')            // Replace spaces with -
      .replace(/[^\w-]+/g, '')        // Remove non-word chars (except -)
      .replace(/--+/g, '-')          // Replace multiple - with single -
      .replace(/^-+/, '')              // Trim - from start of text
      .replace(/-+$/, '');             // Trim - from end of text
    
    // Ensure we're not returning an empty string
    if (!slugged) {
      console.warn('Slugify produced empty result for:', text);
      // Fallback: replace all non-alphanumeric with dashes and ensure not empty
      const fallback = text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');
      return fallback || `topic-${Date.now()}`; // Last resort fallback with timestamp
    }
    
    return slugged;
  } catch (error) {
    console.error('Error in slugify function:', error);
    // Emergency fallback with timestamp to ensure uniqueness
    return `topic-${Date.now()}`;
  }
}

/**
 * Truncate a string to a specified length and add ellipsis if it was truncated
 * @param text The string to truncate
 * @param length The maximum length of the returned string (including ellipsis)
 * @returns The truncated string
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length - 3) + '...';
}

/**
 * Capitalize the first letter of a string
 * @param text The string to capitalize
 * @returns The string with first letter capitalized
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}
