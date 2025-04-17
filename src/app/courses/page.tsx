"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MagnifyingGlassIcon, FunnelIcon, AcademicCapIcon, ClockIcon, StarIcon, UserIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Course type definition
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: string;
  topics: string[];
  imageUrl?: string;
  instructor: {
    id: string;
    name: string;
  };
}

// Define available topics for filtering
const availableTopics = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 
  'HTML', 'CSS', 'Python', 'Data Science', 'Machine Learning',
  'Web Development', 'Backend', 'Frontend', 'Database', 'DevOps'
];

// Featured courses for the hero section
const featuredCourses = [
  {
    id: 'featured-1',
    title: 'Web Development Masterclass',
    description: 'Learn HTML, CSS, JavaScript, React, and more to become a full-stack web developer',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop'
  },
  {
    id: 'featured-2',
    title: 'Machine Learning Fundamentals',
    description: 'Master the core concepts of machine learning and artificial intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop'
  }
];

// Main courses page component wrapped in error boundary
export default function CoursesPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <CoursesPage />
    </ErrorBoundary>
  );
}

// Actual courses page component
function CoursesPage() {
  // State variables
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL parameters
  useEffect(() => {
    const level = searchParams.get('level');
    const topic = searchParams.get('topic');
    const search = searchParams.get('search');
    
    if (level) setSelectedLevel(level);
    if (topic) setSelectedTopics(topic.split(','));
    if (search) setSearchQuery(search);
  }, [searchParams]);
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        if (data.success) {
          setCourses(data.courses);
          setFilteredCourses(data.courses);
        } else {
          setError(data.error || 'Failed to fetch courses');
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);
  
  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)
      );
    }
    
    // Apply level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }
    
    // Apply topics filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(course => 
        selectedTopics.some(topic => course.topics.includes(topic))
      );
    }
    
    setFilteredCourses(filtered);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedTopics.length > 0) params.set('topic', selectedTopics.join(','));
    
    const queryString = params.toString();
    router.push(`/courses${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [searchQuery, selectedLevel, selectedTopics, courses, router]);
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle level selection
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLevel(e.target.value);
  };
  
  // Handle topic selection
  const handleTopicChange = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLevel('');
    setSelectedTopics([]);
    router.push('/courses');
  };
  
  // Placeholder image for courses without an image
  const placeholderImage = '/placeholder-course.jpg';
  
  // If there's an error, throw it to be caught by the error boundary
  if (error) {
    throw new Error(error);
  }
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)',
                 paddingTop: '100px',
                 paddingBottom: '60px'
               }}>
        {/* Floating App Icons */}
        <div className="absolute right-0 top-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* React Icon */}
          <div className="absolute w-24 h-24 md:w-32 md:h-32 top-[15%] right-[15%] animate-float-slow opacity-80">
            <Image 
              src="/icons/react.svg" 
              alt="React Icon" 
              width={120} 
              height={120}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* JavaScript Icon */}
          <div className="absolute w-20 h-20 md:w-28 md:h-28 bottom-[20%] right-[20%] animate-float opacity-80">
            <Image 
              src="/icons/javascript.svg" 
              alt="JavaScript Icon" 
              width={100} 
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* TypeScript Icon */}
          <div className="absolute w-16 h-16 md:w-24 md:h-24 top-[25%] right-[38%] animate-float-slow-reverse opacity-80">
            <Image 
              src="/icons/typescript.svg" 
              alt="TypeScript Icon" 
              width={80} 
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Python Icon */}
          <div className="absolute w-24 h-24 md:w-32 md:h-32 bottom-[15%] left-[10%] animate-float-slow-alt opacity-80">
            <Image 
              src="/icons/python.svg" 
              alt="Python Icon" 
              width={120} 
              height={120}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Node.js Icon */}
          <div className="absolute w-20 h-20 md:w-28 md:h-28 top-[30%] left-[20%] animate-float-alt opacity-80 hidden md:block">
            <Image 
              src="/icons/node.svg" 
              alt="Node.js Icon" 
              width={100} 
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="relative z-10 max-w-[980px] mx-auto px-6 md:px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-[40px] md:text-[56px] font-bold text-white mb-6 tracking-tight leading-tight">
              Explore Our<br />Online Courses
            </h1>
            <p className="text-[18px] md:text-[21px] text-white/80 mb-8 leading-relaxed">
              Elevate your skills with premium courses taught by industry experts. 
              Learn at your own pace with on-demand video content.
            </p>
          </div>
          
          <div className="md:w-1/2 md:pl-12">
            <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden shadow-2xl transform rotate-2 transition-all">
              <Image
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop"
                alt="Student learning online"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        {/* Filters section */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float-slow-reverse {
            0%, 100% { transform: translateY(0) rotate(5deg); }
            50% { transform: translateY(-12px) rotate(-2deg); }
          }
          @keyframes float-slow-alt {
            0%, 100% { transform: translateY(0) rotate(-3deg); }
            50% { transform: translateY(-15px) rotate(3deg); }
          }
          @keyframes float-alt {
            0%, 100% { transform: translateY(0) rotate(3deg); }
            50% { transform: translateY(-10px) rotate(-3deg); }
          }
          
          .animate-float-slow {
            animation: float-slow 7s ease-in-out infinite;
          }
          .animate-float {
            animation: float 5s ease-in-out infinite;
          }
          .animate-float-slow-reverse {
            animation: float-slow-reverse 8s ease-in-out infinite;
          }
          .animate-float-slow-alt {
            animation: float-slow-alt 9s ease-in-out infinite;
          }
          .animate-float-alt {
            animation: float-alt 6s ease-in-out infinite;
          }
        `}</style>
        
        <div className="bg-white p-4 rounded-lg mb-8 shadow-sm">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            
            {/* Level filter */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                id="level"
                value={selectedLevel}
                onChange={handleLevelChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            {/* Topics dropdown */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Topics ({selectedTopics.length} selected)
              </label>
              <div className="relative">
                <details className="w-full">
                  <summary className="px-3 py-2 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">
                    {selectedTopics.length > 0 ? `${selectedTopics.length} topics selected` : 'Select topics'}
                  </summary>
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {availableTopics.map(topic => (
                        <div key={topic} className="flex items-center p-2 hover:bg-gray-100">
                          <input
                            type="checkbox"
                            id={`topic-${topic}`}
                            checked={selectedTopics.includes(topic)}
                            onChange={() => handleTopicChange(topic)}
                            className="mr-2"
                          />
                          <label htmlFor={`topic-${topic}`} className="cursor-pointer text-gray-900">
                            {topic}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
          
          {/* Clear filters button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* No courses found */}
        {!loading && filteredCourses.length === 0 && (
          <div className="bg-yellow-50 text-yellow-700 p-8 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-2">No courses found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
        
        {/* Course grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={course.imageUrl || placeholderImage}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{course.title}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.topics.slice(0, 3).map(topic => (
                      <span key={topic} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {topic}
                      </span>
                    ))}
                    {course.topics.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        +{course.topics.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">${course.price.toFixed(2)}</span>
                    <Link href={`/courses/${course.id}`} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                      View Course
                    </Link>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Instructor: {course.instructor?.name || 'Unknown'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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