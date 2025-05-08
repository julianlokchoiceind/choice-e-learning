'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  ServerIcon,
  CpuChipIcon,
  WrenchScrewdriverIcon,
  PlayCircleIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BoltIcon,
  BookOpenIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { getTotalStudentCount } from '@/server/services/courses/course-service';

// Import sections directly
import {
  FeaturedCoursesSection,
  PopularCoursesSection,
  RoadmapSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  HeroSection
} from '@/client/components/home/sections';

// Simplified roadmap data without React components
const roadmapsData = [
  {
    title: 'Front-End Path',
    description: 'Master HTML, CSS, JavaScript and modern front-end frameworks'
  },
  {
    title: 'Back-End Path',
    description: 'Learn server-side programming, databases, and APIs'
  },
  {
    title: 'Full-Stack Path',
    description: 'Combine front-end and back-end skills to build complete applications'
  }
];

// Since we're using 'use client' now, we can't use async/await at the top level
// Instead we'll fetch data client-side
export default function Home() {
  // Mock data for now - in a real implementation, you'd use React Query or SWR to fetch this
  const totalStudents = 15000;
  const distribution = [0.45, 0.30, 0.15, 0.10];
  const coursesWithRealData = popularCourses.map((course, index) => ({
    ...course,
    students: Math.floor(totalStudents * distribution[index] || 0)
  }));

  return (
    <div className='flex flex-col'>
      {/* Use the HeroSection component instead of inline JSX */}
      <HeroSection />

      {/* Render other sections directly */}
      <FeaturedCoursesSection courses={featuredCourses} />
      <PopularCoursesSection courses={coursesWithRealData} />
      <RoadmapSection roadmaps={roadmapsData} />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}

// Temporary data for the homepage
const featuredCourses = [
  {
    id: 'react-masterclass',
    title: 'React Masterclass',
    description: 'Build advanced React applications with hooks, context API, and more',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    level: 'Intermediate',
    price: 89.99,
    isFeatured: true,
  },
  {
    id: 'node-backend',
    title: 'Node.js Backend Development',
    description: 'Create scalable backend systems with Node.js, Express, and MongoDB',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop',
    level: 'Advanced',
    price: 99.99,
    isFeatured: true,
  },
  {
    id: 'fullstack-javascript',
    title: 'Full Stack JavaScript Bootcamp',
    description: 'Comprehensive course covering frontend and backend development with JavaScript',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    level: 'All Levels',
    price: 129.99,
    isFeatured: true,
  },
];

// New data for popular courses
const popularCourses = [
  {
    id: 'python-fundamentals',
    title: 'Python Fundamentals',
    category: 'Programming',
    students: 0, // Will be updated with real data
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=2074&auto=format&fit=crop'
  },
  {
    id: 'web-development-bootcamp',
    title: 'Complete Web Development Bootcamp',
    category: 'Web Development',
    students: 0, // Will be updated with real data
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop'
  },
  {
    id: 'typescript-advanced',
    title: 'Advanced TypeScript',
    category: 'Programming',
    students: 0, // Will be updated with real data
    image: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'react-native',
    title: 'React Native for Beginners',
    category: 'Mobile Development',
    students: 0, // Will be updated with real data
    image: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?q=80&w=2070&auto=format&fit=crop'
  }
];
