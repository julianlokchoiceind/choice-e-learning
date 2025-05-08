'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Hero section component for the homepage
 * Displays the main hero section with title, description, and call-to-action
 */
const HeroSection = () => {
  return (
    <section className='relative w-full min-h-screen overflow-hidden'
             style={{
               background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)'
             }}>
      {/* Gradient Overlays */}
      <div className='absolute inset-0 bg-gradient-to-b from-blue-400/10 via-transparent to-blue-900/20'></div>
      <div className='absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-400/10'></div>
      
      {/* Radial Gradient for depth */}
      <div className='absolute inset-0 w-full h-full overflow-hidden' 
           style={{
             background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)'
           }}>
      </div>
      
      <div className='relative h-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 h-full items-center'>
          {/* Left Content */}
          <div className='flex flex-col justify-center space-y-8 pt-20 lg:pt-0'>
            <div className='space-y-6'>
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]'>
                Let&apos;s Work <br />
                Together to<br />
                Create Future<br />
                Tech Leaders
              </h1>
              <p className='text-lg sm:text-xl text-gray-200 max-w-[540px]'>
                A visionary learning platform, crafting captivating courses through expert instruction. 
                Adapt to the future with cutting-edge programming skills.
              </p>
            </div>
            
            <div className='flex flex-wrap gap-4'>
              <Link 
                href='/courses'
                className='px-8 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-full transition-all duration-300'
              >
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Right Content */}
          <div className='relative flex items-center justify-center h-full'>
            {/* Main Image Container */}
            <div className='relative w-full max-w-[550px] aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5]'>
              <Image
                src='https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop'
                alt='Professional coding instructor'
                fill
                priority
                className='object-cover object-center rounded-2xl'
                sizes='(max-width: 768px) 100vw, 50vw'
                onError={(e: any) => {
                  console.error('Error loading hero image');
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=2071&auto=format&fit=crop';
                }}
              />
              
              {/* Floating Tech Badges */}
              <div className='absolute top-[15%] right-[-5%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300'>
                <div className='px-6 py-2 bg-[#3B82F6] text-white rounded-full shadow-lg animate-float backdrop-blur-sm'>
                  JavaScript
                </div>
              </div>
              
              <div className='absolute top-[40%] right-[-10%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300'>
                <div className='px-6 py-2 bg-[#22C55E] text-white rounded-full shadow-lg animate-float-slow backdrop-blur-sm'>
                  React Development
                </div>
              </div>
              
              <div className='absolute bottom-[20%] right-[-5%] z-10 transform translate-x-0 hover:translate-x-2 transition-transform duration-300'>
                <div className='px-6 py-2 bg-[#A855F7] text-white rounded-full shadow-lg animate-float-alt backdrop-blur-sm'>
                  Full-Stack Coding
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
