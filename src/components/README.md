# Choice E-Learning Component Structure

This document outlines the component structure for the Choice E-Learning platform.

## Directory Structure

- **src/components/** - Root components directory
  - **admin/** - Admin panel specific components
  - **auth/** - Authentication-related components
  - **common/** - Shared components used across multiple feature areas
  - **home/** - Homepage-specific components
    - **sections/** - Individual section components for the homepage
      - `CTASection.tsx` - Call-to-action section
      - `FeaturedCoursesSection.tsx` - Featured courses grid section
      - `HeroSection.tsx` - Hero/banner section at top of homepage
      - `HowItWorksSection.tsx` - Platform explanation section
      - `PopularCoursesSection.tsx` - Popular courses list section
      - `RoadmapSection.tsx` - Learning roadmap visualization section
      - `TestimonialsSection.tsx` - Student testimonials carousel section
      - `index.ts` - Exports all section components
    - `ClientComponents.tsx` - Main export file for all homepage components
  - **layout/** - Page layout components (header, footer, etc.)
  - **providers/** - Context providers and other wrapper components
  - **ui/** - Reusable UI components
    - **animations/** - Animation-related components
      - `AnimationStyles.tsx` - Global animation styles
      - `CounterScript.tsx` - Number counter animation script
      - `index.ts` - Exports all animation components

## Component Naming Conventions

- **Component Files**: PascalCase with `.tsx` extension (e.g., `HeroSection.tsx`)
- **Directory Names**: camelCase (e.g., `animations`)
- **Export Files**: `index.ts` for directories with multiple components

## Component Organization Principles

1. **Feature/Domain Organization**: Components are organized by feature/domain rather than by type
2. **Component Isolation**: Each component should be self-contained and focused on a single responsibility
3. **Reusability**: Common UI elements are placed in the `ui` directory for reuse across the application
4. **Documentation**: Each component includes JSDoc comments explaining its purpose and props

## Adding New Components

When adding new components:

1. Determine the appropriate directory based on the component's purpose
2. Create a new file using PascalCase naming
3. Include JSDoc documentation for the component and its props
4. Export the component as the default export
5. Add the component to the relevant index file if applicable

## Types

Component-related type definitions are stored in `src/types` directory:

- `course.ts` - Type definitions for course-related data
