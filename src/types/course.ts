/**
 * Type definitions for course-related data
 */

/**
 * Represents a featured course displayed in the featured courses section
 */
export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  price: number;
  isFeatured?: boolean;
}

/**
 * Represents a popular course displayed in the popular courses section
 */
export interface PopularCourse {
  id: string;
  title: string;
  category: string;
  students: number;
  image: string;
}

/**
 * Represents a learning roadmap step
 */
export interface Roadmap {
  title: string;
  description: string;
}

/**
 * Represents a student testimonial
 */
export interface Testimonial {
  name: string;
  title: string;
  avatar: string;
  quote: string;
}

/**
 * Represents a how it works step
 */
export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}
