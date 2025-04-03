import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChatBubbleLeftEllipsisIcon, UserIcon, AcademicCapIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Reviews & Testimonials | Choice E-Learning',
  description: 'Read reviews and testimonials from our students about their learning experiences',
};

// Client component for animation counter
const CounterScript = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        document.addEventListener('DOMContentLoaded', () => {
          const counters = document.querySelectorAll('.counter-value');
          
          const startCounting = () => {
            counters.forEach(counter => {
              const target = parseFloat(counter.getAttribute('data-target'));
              const duration = 1500; // ms
              const increment = target / (duration / 16);
              let current = 0;
              
              const updateCounter = () => {
                current += increment;
                if (current < target) {
                  if (counter.classList.contains('decimal')) {
                    counter.textContent = current.toFixed(1);
                  } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                  }
                  requestAnimationFrame(updateCounter);
                } else {
                  if (counter.classList.contains('decimal')) {
                    counter.textContent = target.toFixed(1);
                  } else {
                    counter.textContent = Math.floor(target).toLocaleString();
                  }
                }
              };
              
              updateCounter();
            });
          };
          
          // Start animation when element is in view
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                startCounting();
                observer.unobserve(entry.target);
              }
            });
          }, { threshold: 0.1 });
          
          const statsSection = document.querySelector('.stats-section');
          if (statsSection) {
            observer.observe(statsSection);
          }
        });
      `
    }} />
  );
};

export default function ReviewsPage() {
  return (
    <>
      <CounterScript />
      
      {/* Hero Section with Gradient Background */}
      <section className="min-h-[40vh] flex items-center justify-center overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
                 paddingTop: '120px',
                 paddingBottom: '60px'
               }}>
        <div className="max-w-[980px] mx-auto px-4 text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-white mb-4 tracking-tight">
            Student Reviews
          </h1>
          <p className="text-[21px] leading-[1.381] text-white/80 max-w-[680px] mx-auto">
            Hear from our students about their experiences with Choice E-Learning courses.
            Join thousands of successful students who have transformed their skills and careers.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Stats Section with Animation */}
        <div className="stats-section grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <StarIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="text-[36px] font-bold text-[#0066cc]">
              <span className="counter-value decimal" data-target="4.8">0</span>
            </div>
            <div className="text-[#86868b]">Average Rating</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <UserIcon className="h-8 w-8 text-[#0066cc]" />
            </div>
            <div className="text-[36px] font-bold text-[#0066cc]">
              <span className="counter-value" data-target="15000">0</span>+
            </div>
            <div className="text-[#86868b]">Students</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-[#0066cc]" />
            </div>
            <div className="text-[36px] font-bold text-[#0066cc]">
              <span className="counter-value" data-target="5200">0</span>+
            </div>
            <div className="text-[#86868b]">Reviews</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckBadgeIcon className="h-8 w-8 text-[#0066cc]" />
            </div>
            <div className="text-[36px] font-bold text-[#0066cc]">
              <span className="counter-value" data-target="98">0</span>%
            </div>
            <div className="text-[#86868b]">Satisfaction Rate</div>
          </div>
        </div>
        
        {/* Featured Reviews */}
        <section className="mb-16">
          <h2 className="text-[32px] font-semibold mb-8 text-[#1d1d1f]">Featured Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredReviews.map((review) => (
              <div 
                key={review.id} 
                className="card hover:shadow-lg transition-transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[17px] text-[#1d1d1f]">{review.name}</h3>
                      <p className="text-[14px] text-[#86868b]">{review.title}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-2 text-[#86868b] text-sm">{review.date}</span>
                  </div>
                  
                  <div>
                    <Link 
                      href={`/courses/${review.courseId}`}
                      className="text-[#0066cc] text-[14px] leading-[1.42859] hover:underline font-medium mb-2 inline-block"
                    >
                      {review.courseName}
                    </Link>
                    <p className="text-[15px] text-[#1d1d1f] line-clamp-4">{review.text}</p>
                  </div>
                  
                  {review.response && (
                    <div className="bg-[#f5f5f7] p-3 rounded-md mt-3">
                      <p className="text-sm font-medium mb-1">Response from instructor:</p>
                      <p className="text-sm text-[#86868b] line-clamp-2">{review.response}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              href="/all-reviews"
              className="button-primary inline-block"
            >
              View All Reviews
            </Link>
          </div>
        </section>
        
        {/* Reviews by Course */}
        <section className="mb-16">
          <h2 className="text-[32px] font-semibold mb-8 text-[#1d1d1f]">Reviews by Course</h2>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            {courseReviews.map((course, idx) => (
              <div key={course.id} className={idx !== 0 ? 'border-t border-gray-200' : ''}>
                <div className="p-4 hover:bg-[#f5f5f7] transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden mr-4">
                        <Image
                          src={course.image}
                          alt={course.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-[#1d1d1f]">{course.name}</h3>
                        <div className="flex items-center">
                          <div className="flex mr-2">
                            {Array(5).fill(0).map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-4 w-4 ${i < course.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-[#86868b]">{course.rating.toFixed(1)} ({course.reviewsCount} reviews)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-[#86868b]">
                      <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">{course.reviewsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Submit Review CTA */}
        <section className="bg-gradient-to-r from-[#004e92] to-[#000428] rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold mb-3 text-white">Share Your Experience</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Your feedback helps other students make informed decisions and helps us improve our courses.
            Please share your honest thoughts about your learning experience.
          </p>
          <Link 
            href="/dashboard"
            className="bg-white text-[#004e92] font-medium px-8 py-4 rounded-full inline-block hover:shadow-lg transition-all hover:scale-105"
          >
            Write a Review
          </Link>
        </section>
      </div>
    </>
  );
}

// Mock data for reviews page
const featuredReviews = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Frontend Developer at Tech Co.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    date: '2 months ago',
    courseId: 'react-masterclass',
    courseName: 'React Masterclass',
    text: 'This course completely transformed my development skills. The instructor breaks down complex concepts into digestible pieces. The projects are practical and helped me build a strong portfolio. I landed my dream job just one month after completing the course!',
    response: null
  },
  {
    id: '2',
    name: 'Michael Chen',
    title: 'Full Stack Developer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    date: '3 months ago',
    courseId: 'node-backend',
    courseName: 'Node.js Backend Development',
    text: 'The project-based approach was exactly what I needed. No more tutorial hell - just real, practical knowledge I could apply immediately. The section on authentication and database design was particularly valuable for my work projects.',
    response: 'Thank you for your feedback, Michael! I\'m glad the course was helpful for your projects. I\'ve added some additional resources on advanced database design that you might find useful.'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    title: 'Freelance Web Developer',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
    rating: 4,
    date: '1 month ago',
    courseId: 'fullstack-javascript',
    courseName: 'Full Stack JavaScript Bootcamp',
    text: 'As a self-taught developer, this platform filled in all my knowledge gaps. The community support is incredible too! The only reason I\'m not giving 5 stars is because some of the material needed updating, but I hear that\'s in progress now.',
    response: null
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Software Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    rating: 5,
    date: '2 weeks ago',
    courseId: 'typescript-fundamentals',
    courseName: 'TypeScript Fundamentals',
    text: 'The course strikes the perfect balance between theory and practice. I especially appreciated the sections on advanced types and integration with React. This has made our codebase much more maintainable and caught many bugs before they reached production.',
    response: null
  },
  {
    id: '5',
    name: 'Lisa Wong',
    title: 'UI/UX Designer & Developer',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    rating: 5,
    date: '1 month ago',
    courseId: 'nextjs-essential',
    courseName: 'Next.js Essential Training',
    text: 'Coming from a design background, I was worried about diving into a framework like Next.js, but this course made the transition smooth. The instructor explains concepts clearly and the exercises cement the learning. I\'ve now built several client projects with Next.js!',
    response: 'Thanks for your kind words, Lisa! It\'s great to hear that the course was accessible for someone with a design background. Your portfolio projects look fantastic!'
  },
  {
    id: '6',
    name: 'James Wilson',
    title: 'Startup Founder',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    rating: 4,
    date: '3 weeks ago',
    courseId: 'react-native-mobile',
    courseName: 'React Native for Mobile Development',
    text: 'This course helped me prototype our company\'s mobile app in record time. The instructor\'s expertise is evident, and the curriculum is well structured. Would have given 5 stars if there was more content on app store deployment, but overall an excellent resource.',
    response: null
  }
];

const courseReviews = [
  {
    id: 'react-masterclass',
    name: 'React Masterclass',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 856
  },
  {
    id: 'node-backend',
    name: 'Node.js Backend Development',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop',
    rating: 4.7,
    reviewsCount: 734
  },
  {
    id: 'fullstack-javascript',
    name: 'Full Stack JavaScript Bootcamp',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 1204
  },
  {
    id: 'typescript-fundamentals',
    name: 'TypeScript Fundamentals',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop',
    rating: 4.6,
    reviewsCount: 521
  },
  {
    id: 'nextjs-essential',
    name: 'Next.js Essential Training',
    image: 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=1974&auto=format&fit=crop',
    rating: 4.7,
    reviewsCount: 312
  }
]; 