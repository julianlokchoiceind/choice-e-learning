'use client';

import { ReactNode } from 'react';
import Link from "next/link";
import Image from "next/image";
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
import { getTotalStudentCount } from '@/services/courses';
import ClientComponents from '@/components/home/ClientComponents';

// Simplified roadmap data without React components
const roadmapsData = [
  {
    title: "Front-End Path",
    description: "Master HTML, CSS, JavaScript and modern front-end frameworks"
  },
  {
    title: "Back-End Path",
    description: "Learn server-side programming, databases, and APIs"
  },
  {
    title: "Full-Stack Path",
    description: "Combine front-end and back-end skills to build complete applications"
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-screen overflow-hidden"
               style={{
                 background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)'
               }}>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400/10 via-transparent to-blue-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-400/10"></div>
        
        {/* Radial Gradient for depth */}
        <div className="absolute inset-0" 
             style={{
               background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
             }}>
        </div>
        
        <div className="relative h-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 h-full items-center">
            {/* Left Content */}
            <div className="flex flex-col justify-center space-y-8 pt-20 lg:pt-0">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                  Let's Work <br />
                  Together to<br />
                  Create Future<br />
                  Tech Leaders
                </h1>
                <p className="text-lg sm:text-xl text-gray-200 max-w-[540px]">
                  A visionary learning platform, crafting captivating courses through expert instruction. 
                  Adapt to the future with cutting-edge programming skills.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/courses"
                  className="px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full transition-all duration-300"
                >
                  Browse Courses
                </Link>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative flex items-center justify-center h-full">
              {/* Main Image Container */}
              <div className="relative w-full max-w-[600px] aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"
                  alt="Professional coding instructor"
                  fill
                  priority
                  className="object-cover object-center rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    console.error('Error loading hero image');
                    e.currentTarget.src = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop";
                  }}
                />
                
                {/* Floating Tech Badges */}
                <div className="absolute top-[15%] right-[-5%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300">
                  <div className="px-6 py-2 bg-[#3B82F6] text-white rounded-full shadow-lg animate-float backdrop-blur-sm">
                    JavaScript
                  </div>
                </div>
                
                <div className="absolute top-[40%] right-[-10%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300">
                  <div className="px-6 py-2 bg-[#22C55E] text-white rounded-full shadow-lg animate-float-slow backdrop-blur-sm">
                    React Development
                  </div>
                </div>
                
                <div className="absolute bottom-[20%] right-[-5%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300">
                  <div className="px-6 py-2 bg-[#A855F7] text-white rounded-full shadow-lg animate-float-alt backdrop-blur-sm">
                    Full-Stack Coding
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Render rest of sections using client components */}
      <ClientComponents.FeaturedCoursesSection courses={featuredCourses} />
      <ClientComponents.PopularCoursesSection courses={coursesWithRealData} />
      <ClientComponents.RoadmapSection roadmaps={roadmapsData} />
      <ClientComponents.HowItWorksSection />
      <ClientComponents.TestimonialsSection />
      <ClientComponents.CTASection />
    </div>
  );
}

// Temporary data for the homepage
const featuredCourses = [
  {
    id: "react-masterclass",
    title: "React Masterclass",
    description: "Build advanced React applications with hooks, context API, and more",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
    level: "Intermediate",
    price: 89.99,
    isFeatured: true,
  },
  {
    id: "node-backend",
    title: "Node.js Backend Development",
    description: "Create scalable backend systems with Node.js, Express, and MongoDB",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop",
    level: "Advanced",
    price: 99.99,
    isFeatured: true,
  },
  {
    id: "fullstack-javascript",
    title: "Full Stack JavaScript Bootcamp",
    description: "Comprehensive course covering frontend and backend development with JavaScript",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
    level: "All Levels",
    price: 129.99,
    isFeatured: true,
  },
];

// New data for popular courses
const popularCourses = [
  {
    id: "python-fundamentals",
    title: "Python Fundamentals",
    category: "Programming",
    students: 0, // Will be updated with real data
    image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?q=80&w=2074&auto=format&fit=crop"
  },
  {
    id: "web-development-bootcamp",
    title: "Complete Web Development Bootcamp",
    category: "Web Development",
    students: 0, // Will be updated with real data
    image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=2064&auto=format&fit=crop"
  },
  {
    id: "typescript-advanced",
    title: "Advanced TypeScript",
    category: "Programming",
    students: 0, // Will be updated with real data
    image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "react-native",
    title: "React Native for Beginners",
    category: "Mobile Development",
    students: 0, // Will be updated with real data
    image: "https://images.unsplash.com/photo-1622675363311-3e1904dc1885?q=80&w=2070&auto=format&fit=crop"
  }
];
