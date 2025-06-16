'use client';

/**
 * Utility functions for form handling and dirty state detection
 */

/**
 * Deep compare two objects to determine if they are equal
 * Handles nested objects and arrays
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }
  
  if (obj1 == null || obj2 == null) {
    return obj1 === obj2;
  }
  
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }
  
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    
    return true;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Normalize form data for comparison
 * Trims strings, converts empty strings to null, etc.
 */
export function normalizeFormData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    const trimmed = data.trim();
    // Don't convert empty strings to null for form data - preserve empty strings
    return trimmed;
  }
  
  if (typeof data === 'number') {
    return data;
  }
  
  if (typeof data === 'boolean') {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(normalizeFormData);
  }
  
  if (typeof data === 'object') {
    const normalized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        normalized[key] = normalizeFormData(data[key]);
      }
    }
    return normalized;
  }
  
  return data;
}

/**
 * Check if form data is dirty compared to initial data
 * Uses normalized comparison to handle edge cases
 */
export function isFormDirty(currentData: any, initialData: any): boolean {
  const normalizedCurrent = normalizeFormData(currentData);
  const normalizedInitial = normalizeFormData(initialData);
  
  return !deepEqual(normalizedCurrent, normalizedInitial);
}

/**
 * Extract only the relevant fields for comparison
 * Removes UI-only fields like newCategory, etc.
 */
export function extractComparableData(formData: any, fieldsToCompare: string[]): any {
  const comparable: any = {};
  
  for (const field of fieldsToCompare) {
    if (formData.hasOwnProperty(field)) {
      comparable[field] = formData[field];
    }
  }
  
  return comparable;
}