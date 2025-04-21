/**
 * Feature Flag System
 * 
 * This module provides a simple feature flag system to help with gradual rollouts
 * and safe development practices.
 */

// Define feature flags and their default state
export const Features = {
  // Course features
  NEW_COURSE_UI: false,
  ADVANCED_COURSE_FILTERING: false,
  COURSE_RATINGS: true,
  
  // User features
  ENHANCED_USER_PROFILES: false,
  SOCIAL_SHARING: false,
  
  // Learning features
  INTERACTIVE_LESSONS: false,
  ACHIEVEMENT_SYSTEM: true,
  
  // Infrastructure
  USE_NEW_API_ENDPOINTS: true,
  STANDARDIZED_ROUTE_PARAMS: true,
} as const;

// Create a type from the features object
export type FeatureKey = keyof typeof Features;

/**
 * Override flags from environment variables if present
 * Format: NEXT_PUBLIC_FEATURE_FLAG_[FLAG_NAME]=true|false
 */
export function getFeatureFlags(): Record<FeatureKey, boolean> {
  const flags = { ...Features };
  
  if (typeof window !== 'undefined') {
    // Client-side only
    Object.keys(flags).forEach(key => {
      const envKey = `NEXT_PUBLIC_FEATURE_FLAG_${key}`;
      const envValue = process.env[envKey];
      
      if (envValue !== undefined) {
        (flags as any)[key] = envValue === 'true';
      }
    });
  }
  
  return flags;
}

/**
 * Check if a feature is enabled
 * @param feature The feature to check
 * @returns true if the feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return getFeatureFlags()[feature];
} 