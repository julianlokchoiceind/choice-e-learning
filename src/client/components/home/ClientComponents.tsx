'use client';

/**
 * This file exports all client-side components for the homepage
 * All components have been moved to their own files for better organization
 */

import { AnimationStyles, CounterScript } from '../ui/animations';
import {
  HeroSection,
  FeaturedCoursesSection,
  PopularCoursesSection,
  RoadmapSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection
} from './sections';

// Export all components for use in the homepage
const ClientComponents = {
  AnimationStyles,
  CounterScript,
  HeroSection,
  FeaturedCoursesSection,
  PopularCoursesSection,
  RoadmapSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection
};

export default ClientComponents;
