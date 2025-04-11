import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon, FunnelIcon, AcademicCapIcon, ClockIcon, StarIcon, UserIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getAllCourses } from '@/services/courses';

export const metadata = {
  title: 'All Courses | Choice E-Learning',
  description: 'Browse our comprehensive collection of coding and development courses',
};

export default async function CoursesPage() {
  // Fetch courses from the database
  const courses = await getAllCourses();
  
  return (
    <>
      {/* Hero Section */}
      <section className="section-tight relative">
        <div 
          className="absolute inset-0 z-0" 
          style={{ 
            background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
          }}
        />
        
        <div className="container relative z-10 pt-20 pb-16 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore Our Courses
            </h1>
            <p className="text-xl text-white/80 mb-6">
              Discover high-quality courses taught by industry experts
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-[#86868b]" />
              </div>
              <input
                type="text"
                className="w-full py-3 pl-10 pr-4 rounded-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                placeholder="Search for any course or topic..."
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Course Listing Section */}
      <section className="section-wide">
        <div className="max-w-6xl mx-auto py-16 px-4 md:px-6">
          {/* Filters and Sort Options */}
          <div className="mb-12">
            <div className="bg-white shadow-sm rounded-xl border border-[#d2d2d7] p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <select 
                    className="block w-full appearance-none bg-transparent border border-[#d2d2d7] text-[#1d1d1f] rounded-lg px-4 py-3 pr-8"
                    defaultValue=""
                  >
                    <option value="" disabled>Category</option>
                    <option value="web-dev">Web Development</option>
                    <option value="mobile-dev">Mobile Development</option>
                    <option value="data-science">Data Science</option>
                    <option value="cloud">Cloud Computing</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#86868b]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative flex-1">
                  <select 
                    className="block w-full appearance-none bg-transparent border border-[#d2d2d7] text-[#1d1d1f] rounded-lg px-4 py-3 pr-8"
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
            <h2 className="text-[32px] font-semibold mb-8 text-[#1d1d1f]">All Courses</h2>
            
            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses && courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course.id} className="card group bg-white border border-[#d2d2d7] rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
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
                          {course.duration || '8 weeks'}
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
                                className={`h-4 w-4 ${i < Math.floor(course.rating || 4.5) ? 'text-[#f9ad32] fill-[#f9ad32]' : 'text-[#d2d2d7]'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[#86868b] text-sm ml-2">{course.rating || 4.5}</span>
                        </div>
                        <span className="text-[#1d1d1f] font-semibold">${course.price}</span>
                      </div>
                      <Link
                        href={`/courses/${course.id}`}
                        className="mt-4 w-full flex justify-center items-center py-2 px-4 rounded-full bg-[#0066cc] text-white text-sm font-medium hover:bg-[#004499] transition-colors group-hover:bg-[#004499]"
                      >
                        View Course <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-[#86868b] text-lg">No courses found. Please check back later.</p>
                </div>
              )}
            </div>
          </div>
          
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
      <section className="section-tight bg-gradient-to-b from-[#f5f5f7] to-white py-20">
        <div className="max-w-[700px] mx-auto px-6 md:px-4">
          <div className="bg-gradient-to-r from-[#000428] to-[#004e92] rounded-2xl text-center py-12 px-8 shadow-lg">
            <h2 className="text-[32px] text-white font-bold mb-5">Can't find what you're looking for?</h2>
            <p className="text-[18px] text-white/90 mb-8 max-w-[480px] mx-auto">
              We're constantly adding new courses. Request a topic or check our upcoming course schedule.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="bg-white/20 text-white font-medium py-3 px-6 rounded-full">
                Request a Course
              </Link>
              <Link href="/upcoming" className="bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full">
                View Upcoming Courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Loading skeleton component for courses
function CoursesLoadingSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="bg-gray-200 h-48 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 w-4 bg-gray-200 rounded-full"></div>
                ))}
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="mt-4 h-10 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </>
  );
} 