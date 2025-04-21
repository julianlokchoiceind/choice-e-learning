"use client";

import React from 'react';
import { FeatureKey, isFeatureEnabled } from '@/lib/features/featureFlags';

/**
 * Conditionally render content based on a feature flag
 * @param feature The feature to check
 * @param enabled Content to render when the feature is enabled
 * @param disabled Optional content to render when the feature is disabled
 */
export default function FeatureFlag({ 
  feature, 
  enabled, 
  disabled = null 
}: { 
  feature: FeatureKey; 
  enabled: React.ReactNode; 
  disabled?: React.ReactNode | null;
}): React.ReactElement {
  return isFeatureEnabled(feature) ? <>{enabled}</> : <>{disabled}</>;
} 