import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon, AcademicCapIcon, ClockIcon, StarIcon, UserIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'All Courses | Choice E-Learning',
  description: 'Browse our comprehensive collection of coding and development courses',
};

export default function CoursesPage() {
  return (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="min-h-[40vh] flex items-center justify-center overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
                 paddingTop: '120px',
                 paddingBottom: '60px'
               }}>
        <div className="max-w-[980px] mx-auto px-6 md:px-4 text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-white mb-4 tracking-tight">
            Explore Our Courses
          </h1>
          <p className="text-[21px] leading-[1.381] text-white/80 max-w-[680px] mx-auto mb-8">
            Start your learning journey with our comprehensive collection of expert-led courses
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#frontend" className="bg-white/20 text-white font-medium px-5 py-2 rounded-full hover:bg-white/30 transition-colors">
              Frontend
            </a>
            <a href="#backend" className="bg-white/20 text-white font-medium px-5 py-2 rounded-full hover:bg-white/30 transition-colors">
              Backend
            </a>
            <a href="#fullstack" className="bg-white/20 text-white font-medium px-5 py-2 rounded-full hover:bg-white/30 transition-colors">
              Full Stack
            </a>
            <a href="#mobile" className="bg-white/20 text-white font-medium px-5 py-2 rounded-full hover:bg-white/30 transition-colors">
              Mobile
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-full bg-white py-16">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          {/* Search and Filter Section */}
          <div className="mb-12 bg-[#f5f5f7] p-6 rounded-2xl">
            <h2 className="text-[24px] font-semibold mb-6 text-[#1d1d1f]">Find Your Perfect Course</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-[#86868b]" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-[#d2d2d7] rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all duration-200 text-[15px]"
                  placeholder="Search courses..."
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-auto">
                  <select
                    className="appearance-none w-full sm:w-44 bg-white border border-[#d2d2d7] text-[#1d1d1f] py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all duration-200"
                    defaultValue=""
                  >
                    <option value="" disabled>Category</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="fullstack">Full Stack</option>
                    <option value="mobile">Mobile</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#86868b]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    className="appearance-none w-full sm:w-44 bg-white border border-[#d2d2d7] text-[#1d1d1f] py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-[#0066cc] transition-all duration-200"
                    defaultValue=""
                  >
                    <option value="" disabled>Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#86868b]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-3 border border-[#d2d2d7] text-[#1d1d1f] font-medium rounded-lg bg-white hover:bg-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0066cc] transition-all duration-200"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>

          {/* Course Categories */}
          <div className="mb-16">
            <h2 className="text-[32px] font-semibold mb-8 text-[#1d1d1f]">Featured Courses</h2>
            
            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.filter(course => course.isFeatured).map((course) => (
                <div key={course.id} className="card hover:shadow-md">
                  <div className="relative">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {course.isFeatured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-block bg-[#ffeeb1] text-[#8a6d3b] text-xs font-medium px-3 py-1 rounded-md shadow-sm">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block bg-[#e3efff] text-[#0066cc] text-xs font-medium px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <div className="flex items-center text-[#86868b] text-sm">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {course.duration}
                      </div>
                    </div>
                    <h3 className="text-[20px] leading-[1.3] font-semibold mb-3 text-[#1d1d1f]">{course.title}</h3>
                    <p className="text-[#86868b] mb-4 text-[15px] line-clamp-3 min-h-[70px]">{course.description}</p>
                    <div className="flex justify-between items-center border-t border-[#d2d2d7] pt-4 mt-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-[#d2d2d7]'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[14px] text-[#86868b] ml-2">({course.reviews})</span>
                      </div>
                      <span className="text-[#1d1d1f] font-semibold">${course.price}</span>
                    </div>
                    <Link 
                      href={`/courses/${course.id}`}
                      className="block mt-4 text-center text-[#0066cc] bg-[#e3efff] hover:bg-[#cce4ff] font-medium py-2 px-4 rounded-full transition-colors"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* All Courses Section */}
          <div>
            <h2 className="text-[32px] font-semibold mb-8 text-[#1d1d1f]">All Courses</h2>
            
            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.filter(course => !course.isFeatured).map((course) => (
                <div key={course.id} className="card hover:shadow-md">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block bg-[#e3efff] text-[#0066cc] text-xs font-medium px-3 py-1 rounded-full">
                        {course.level}
                      </span>
                      <div className="flex items-center text-[#86868b] text-sm">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {course.students} students
                      </div>
                    </div>
                    <h3 className="text-[20px] leading-[1.3] font-semibold mb-3 text-[#1d1d1f]">{course.title}</h3>
                    <p className="text-[#86868b] mb-4 text-[15px] line-clamp-3 min-h-[70px]">{course.description}</p>
                    <div className="flex justify-between items-center border-t border-[#d2d2d7] pt-4 mt-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-[#fbbf24] fill-[#fbbf24]' : 'text-[#d2d2d7]'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[14px] text-[#86868b] ml-2">({course.reviews})</span>
                      </div>
                      <span className="text-[#1d1d1f] font-semibold">${course.price}</span>
                    </div>
                    <Link 
                      href={`/courses/${course.id}`}
                      className="block mt-4 text-center text-[#0066cc] bg-[#e3efff] hover:bg-[#cce4ff] font-medium py-2 px-4 rounded-full transition-colors"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pagination */}
          <div className="mt-16 flex justify-center">
            <nav className="inline-flex bg-[#f5f5f7] rounded-full p-1">
              <a href="#" className="px-4 py-2 text-[#86868b] hover:text-[#0066cc]">
                Previous
              </a>
              <a href="#" className="px-4 py-2 text-white bg-[#0066cc] rounded-full">1</a>
              <a href="#" className="px-4 py-2 text-[#1d1d1f] hover:text-[#0066cc]">2</a>
              <a href="#" className="px-4 py-2 text-[#1d1d1f] hover:text-[#0066cc]">3</a>
              <a href="#" className="px-4 py-2 text-[#86868b] hover:text-[#0066cc]">
                Next
              </a>
            </nav>
          </div>
        </div>
      </section>
      
      {/* Enhanced CTA Section */}
      <section className="section-tight bg-gradient-light py-20">
        <div className="max-w-[700px] mx-auto px-6 md:px-4">
          <div className="bg-gradient-blue rounded-2xl text-center py-12 px-8 shadow-lg">
            <h2 className="text-[32px] text-white font-bold mb-5">Can't find what you're looking for?</h2>
            <p className="text-[18px] text-white/90 mb-8 max-w-[480px] mx-auto">
              We're constantly adding new courses. Request a topic or check our upcoming course schedule.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="bg-white/20 text-white hover:bg-white/30 font-medium py-3 px-6 rounded-full transition-all">
                Request a Course
              </Link>
              <Link href="/upcoming" className="bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full hover:shadow-lg transition-transform hover:-translate-y-1">
                View Upcoming Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Enhanced mock course data
const courses = [
  {
    id: "react-masterclass",
    title: "React Masterclass",
    description: "Build advanced React applications with hooks, context API, and more",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
    level: "Intermediate",
    price: 89.99,
    duration: "8 weeks",
    isFeatured: true,
    rating: 4.8,
    reviews: 856,
    students: 3254
  },
  {
    id: "node-backend",
    title: "Node.js Backend Development",
    description: "Create scalable backend systems with Node.js, Express, and MongoDB",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop",
    level: "Advanced",
    price: 99.99,
    duration: "10 weeks",
    isFeatured: true,
    rating: 4.7,
    reviews: 643,
    students: 2189
  },
  {
    id: "fullstack-javascript",
    title: "Full Stack JavaScript Bootcamp",
    description: "Comprehensive course covering frontend and backend development with JavaScript",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
    level: "All Levels",
    price: 129.99,
    duration: "12 weeks",
    isFeatured: true,
    rating: 4.9,
    reviews: 1248,
    students: 5671
  },
  {
    id: "typescript-fundamentals",
    title: "TypeScript Fundamentals",
    description: "Learn TypeScript to build more robust JavaScript applications",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    level: "Beginner",
    price: 59.99,
    duration: "6 weeks",
    isFeatured: false,
    rating: 4.6,
    reviews: 427,
    students: 1856
  },
  {
    id: "nextjs-essential",
    title: "Next.js Essential Training",
    description: "Master Next.js to build SEO-friendly and performant React applications",
    image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=1974&auto=format&fit=crop",
    level: "Intermediate",
    price: 79.99,
    duration: "7 weeks",
    isFeatured: false,
    rating: 4.7,
    reviews: 389,
    students: 1542
  },
  {
    id: "html-css-fundamentals",
    title: "HTML & CSS Fundamentals",
    description: "Start your web development journey with essential HTML and CSS skills",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
    level: "Beginner",
    price: 49.99,
    duration: "5 weeks",
    isFeatured: false,
    rating: 4.5,
    reviews: 812,
    students: 3975
  },
  {
    id: "react-native-mobile",
    title: "React Native for Mobile Development",
    description: "Build cross-platform mobile apps for iOS and Android using React Native",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
    level: "Advanced",
    price: 109.99,
    duration: "9 weeks",
    isFeatured: false,
    rating: 4.8,
    reviews: 276,
    students: 1124
  },
  {
    id: "graphql-api",
    title: "GraphQL API Development",
    description: "Create efficient APIs with GraphQL, Apollo Server, and various databases",
    image: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=2070&auto=format&fit=crop",
    level: "Advanced",
    price: 94.99,
    duration: "8 weeks",
    isFeatured: false,
    rating: 4.6,
    reviews: 321,
    students: 945
  },
]; 