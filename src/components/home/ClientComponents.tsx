'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
import { StarIcon } from '@heroicons/react/24/outline';

// Animation styles component (Client Component)
const AnimationStyles = () => {
  return (
    <style jsx global>{`
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-10px) rotate(2deg); }
      }
      
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-15px) rotate(-2deg); }
      }
      
      @keyframes float-alt {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-12px) rotate(3deg); }
      }
      
      .animate-float {
        animation: float 4s ease-in-out infinite;
      }
      
      .animate-float-slow {
        animation: float-slow 6s ease-in-out infinite;
      }
      
      .animate-float-alt {
        animation: float-alt 5s ease-in-out infinite;
      }
    `}</style>
  );
};

// Client component for animation counter
const CounterScript = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        document.addEventListener('DOMContentLoaded', () => {
          const statsContainers = document.querySelectorAll('.stats-container');
          const animateCounters = function() {
            statsContainers.forEach(container => {
              const rect = container.getBoundingClientRect();
              const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
              
              if (isVisible) {
                container.classList.add('visible');
                const counters = container.querySelectorAll('.animate-counter');
                counters.forEach(counter => {
                  const target = parseInt(counter.getAttribute('data-target'));
                  const duration = 1500;
                  const start = 0;
                  const increment = Math.ceil(target / (duration / 50));
                  let current = start;
                  
                  const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                      counter.textContent = current;
                      setTimeout(updateCounter, 50);
                    } else {
                      counter.textContent = target.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
                    }
                  };
                  
                  updateCounter();
                });
              }
            });
          };
          
          // Run once on load
          animateCounters();
          
          // Add event listener for scroll
          window.addEventListener('scroll', animateCounters);
        });
      `
    }} />
  );
};

// Client component for the hero section that contains the styled-jsx
const HeroSection = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" 
             style={{ 
               background: 'linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%)',
               paddingTop: '100px',
               paddingBottom: '80px'
             }}>
      <AnimationStyles />
      {children}
    </section>
  );
};

// Types for course data
interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  price: number;
  isFeatured?: boolean;
}

interface PopularCourse {
  id: string;
  title: string;
  category: string;
  students: number;
  image: string;
}

interface Roadmap {
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  title: string;
  avatar: string;
  quote: string;
}

// Featured Courses Section
const FeaturedCoursesSection = ({ courses }: { courses: FeaturedCourse[] }) => {
  return (
    <section className="section-full py-20 md:py-[120px] bg-white">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Featured Courses</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {courses.map((course) => (
            <div key={course.id} className="card group hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="relative h-[225px] overflow-hidden rounded-t-lg">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="inline-block bg-[#e3efff] text-[#0066cc] text-xs font-medium px-2.5 py-0.5 rounded-md">
                    {course.level}
                  </span>
                  {course.isFeatured && (
                    <span className="inline-block bg-[#ffeeb1] text-[#8a6d3b] text-xs font-medium px-2.5 py-0.5 rounded-md">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="text-[21px] leading-[1.381] font-semibold mb-2">{course.title}</h3>
                <p className="text-[14px] leading-[1.42859] text-[#86868b] mb-4 line-clamp-2">{course.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#1d1d1f]">${course.price}</span>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="text-[#0066cc] text-[14px] leading-[1.42859] group-hover:underline"
                  >
                    Learn more <FaChevronRight className="inline-block ml-1 h-[10px] w-[10px]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/courses" className="bg-[#f5f5f7] hover:bg-[#e5e5e7] text-[#1d1d1f] font-medium py-3 px-6 rounded-full transition-colors shadow-sm">
            View all courses
          </Link>
        </div>
      </div>
    </section>
  );
};

// Popular Courses Section
const PopularCoursesSection = ({ courses }: { courses: PopularCourse[] }) => {
  return (
    <section className="section-tight py-20 md:py-[100px] bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Popular Right Now</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="card flex group items-center p-5 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-6 flex-grow">
                <h3 className="text-[17px] leading-[1.47059] font-semibold group-hover:text-[#0066cc] transition-colors">{course.title}</h3>
                <p className="text-[14px] leading-[1.42859] text-[#86868b] mt-1">{course.category} • {course.students} students</p>
              </div>
              <div className="ml-4">
                <FaChevronRight className="text-[#86868b] group-hover:text-[#0066cc] transition-colors h-[12px] w-[12px]" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/courses/popular" className="bg-white hover:bg-[#f5f5f7] text-[#0066cc] border border-[#e5e5e7] font-medium py-3 px-6 rounded-full transition-colors shadow-sm">
            See all popular courses <FaChevronRight className="inline-block ml-1 h-[10px] w-[10px]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Roadmap Section
const RoadmapSection = ({ roadmaps }: { roadmaps: Roadmap[] }) => {
  return (
    <section className="section-full py-20 md:py-[120px] bg-white">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Your Learning Roadmap</h2>
        <p className="text-[21px] leading-[1.381] text-[#86868b] max-w-[600px] mx-auto mb-16 text-center">
          Not sure where to start? Follow our curated learning paths to go from beginner to professional developer.
        </p>
        
        {/* Desktop view */}
        <div className="hidden md:flex flex-row justify-center items-center gap-8 mb-12 relative">
          {/* Horizontal connecting lines */}
          {roadmaps.map((roadmap, index) => (
            <div key={index} className="flex-1 max-w-[280px] mx-auto relative z-10">
              {index < roadmaps.length - 1 && (
                <div className="absolute h-1 bg-[#0066cc] top-[28px] left-1/2 w-full z-0"></div>
              )}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xl font-semibold mb-5 z-10 relative">
                  {index + 1}
                </div>
                <h3 className="text-[21px] leading-[1.381] font-semibold mb-2 text-center">{roadmap.title}</h3>
                <p className="text-[14px] leading-[1.42859] text-[#86868b] text-center">{roadmap.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile view */}
        <div className="md:hidden flex flex-col items-center gap-0 mb-12">
          {roadmaps.map((roadmap, index) => (
            <div key={index} className="w-full flex flex-col items-center relative mb-16 last:mb-0">
              {/* Vertical connecting line */}
              {index < roadmaps.length - 1 && (
                <div className="absolute w-[2px] bg-[#0066cc] h-[120px]" style={{ top: '56px', left: '50%', transform: 'translateX(-50%)' }}></div>
              )}
              
              <div className="w-14 h-14 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xl font-semibold mb-5 z-10 relative">
                {index + 1}
              </div>
              <div className="text-center relative z-10 bg-white px-2">
                <h3 className="text-[21px] leading-[1.381] font-semibold mb-2 text-center">{roadmap.title}</h3>
                <p className="text-[14px] leading-[1.42859] text-[#86868b] text-center max-w-[280px]">{roadmap.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Link href="/roadmap" className="bg-[#f5f5f7] hover:bg-[#e5e5e7] text-[#1d1d1f] font-medium py-3 px-6 rounded-full transition-colors shadow-sm block w-fit mx-auto">
          Explore roadmaps
        </Link>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Choose Your Path",
      description: "Select from our range of courses based on your goals and experience level"
    },
    {
      step: "2",
      title: "Learn by Building",
      description: "Follow along with video lectures and build real-world projects"
    },
    {
      step: "3",
      title: "Join the Community",
      description: "Connect with other students, get feedback, and share your progress"
    }
  ];

  return (
    <section className="section-tight py-20 md:py-[100px] bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-5">
                {step.step}
              </div>
              <h3 className="text-[21px] leading-[1.381] font-semibold mb-3">{step.title}</h3>
              <p className="text-[14px] leading-[1.42859] text-[#86868b]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Frontend Developer at Tech Co.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      quote: "The React Masterclass completely transformed my development skills. I landed my dream job just one month after completing the course!"
    },
    {
      name: "Michael Chen",
      title: "Full Stack Developer",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      quote: "The project-based approach was exactly what I needed. No more tutorial hell - just real, practical knowledge I could apply immediately."
    },
    {
      name: "Emma Rodriguez",
      title: "Freelance Web Developer",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      quote: "As a self-taught developer, this platform filled in all my knowledge gaps. The community support is incredible too!"
    }
  ];

  return (
    <section className="section-full py-20 md:py-[90px] bg-white overflow-hidden">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Student Stories</h2>

        <div className="relative py-8">
          <div className="flex overflow-hidden" id="testimonialTicker">
            <div className="flex animate-ticker">
              {/* Double the testimonials for seamless loop */}
              {[...testimonials, ...testimonials].map((testimonial, i) => (
                <div key={i} className="flex-shrink-0 w-[350px] m-4">
                  <div className="card p-8 shadow-lg bg-white rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300 h-full">
                    <div className="flex items-center mb-6">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-[17px] leading-[1.47059] font-semibold">{testimonial.name}</h4>
                        <p className="text-[14px] leading-[1.42859] text-[#86868b]">{testimonial.title}</p>
                      </div>
                    </div>
                    <p className="text-[14px] leading-[1.42859] text-[#86868b] leading-relaxed">"{testimonial.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/reviews" className="bg-white hover:bg-[#f5f5f7] text-[#0066cc] border border-[#e5e5e7] font-medium py-3 px-6 rounded-full transition-colors shadow-sm">
            Read all stories <FaChevronRight className="inline-block ml-1 h-[10px] w-[10px]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="section-tight py-16 md:py-20 bg-[#f5f5f7]">
      <div className="max-w-[580px] mx-auto px-6 md:px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-5">Ready to start your coding journey?</h2>
        <p className="text-[17px] leading-[1.47059] text-[#86868b] mb-8">
          Join thousands of students who have already taken the first step toward becoming a developer
        </p>
        <Link href="/signup" className="bg-[#0066cc] hover:bg-[#0055b3] text-white font-medium py-3 px-6 rounded-full transition-colors shadow-sm">
          Get started today
        </Link>
      </div>
    </section>
  );
};

// Export client components
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
