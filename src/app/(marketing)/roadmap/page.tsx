'use client';

import React, { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, ArrowRightIcon, ChevronRightIcon, CodeBracketIcon, CommandLineIcon, ServerIcon, CpuChipIcon, WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

export const metadata: Metadata = {
  title: 'Learning Roadmap | Choice E-Learning',
  description: 'Your step-by-step guide to becoming a professional through our structured learning paths.',
};

// Define interfaces for our data structures
interface Pathway {
  id: string;
  title: string;
  description: string;
  icon: string;
  courses: number;
  duration: string;
}

interface WebDevStep {
  id: string;
  title: string;
  description: string;
  skills: string[];
}

export default function RoadmapPage() {
  // Sử dụng React Query thay vì state loading thủ công
  const { data, isLoading, error } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      // Mô phỏng API call - trong thực tế sẽ fetch từ API
      return new Promise<{
        pathways: Pathway[];
        webDevSteps: WebDevStep[];
      }>((resolve) => {
        setTimeout(() => {
          resolve({
            pathways,
            webDevSteps
          });
        }, 1200);
      });
    }
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <LoadingState variant="page" message="Loading roadmap..." />
    </div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
        <p className="font-bold">Error</p>
        <p>{error instanceof Error ? error.message : 'Failed to load roadmap'}</p>
      </div>
    </div>;
  }

  // Destructure data with default values
  const { pathways = [], webDevSteps = [] } = data || {};
  
  return (
    <>
      {/* Enhanced Hero Section with Background Image and Overlay */}
      <section className='page-hero relative overflow-hidden min-h-[500px] flex items-center'>
        {/* Background Image */}
        <div className='absolute inset-0 z-0'>
          <Image 
            src='/images/backgrounds/education-hero.svg' 
            alt='Education Background' 
            fill 
            className='object-cover' 
            priority
          />
          {/* Overlay with site&apos;s main blue gradient - semi-transparent for SVG background */}
          <div className='absolute inset-0' style={{ background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)' }}></div>
        </div>
        
        {/* Decorative floating elements */}
        <div className='absolute top-1/4 right-[15%] w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm animate-float' style={{ animationDelay: '0s' }}></div>
        <div className='absolute bottom-1/4 left-[20%] w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm animate-float' style={{ animationDelay: '0.5s' }}></div>
        <div className='absolute top-1/3 left-[15%] w-8 h-8 rotate-45 bg-white/10 backdrop-blur-sm animate-float' style={{ animationDelay: '1s' }}></div>
        <div className='absolute bottom-1/3 right-[20%] w-10 h-10 rounded-md bg-white/10 backdrop-blur-sm animate-float' style={{ animationDelay: '1.5s' }}></div>
        
        <div className='max-w-[980px] mx-auto px-6 md:px-4 relative z-10 py-16 md:py-24 text-center'>
          <h1 className='h1 text-white text-center max-w-[720px] mx-auto leading-tight'>
            Start Your Learning Journey With a Clear Path
          </h1>
          <p className='text-[21px] leading-[1.381] text-white/90 max-w-[680px] mx-auto mt-6 text-center'>
            Follow our expertly designed learning roadmaps and achieve your goals with a structured, step-by-step approach
          </p>
          <div className='flex justify-center mt-10'>
            <Link 
              href='#learning-paths' 
              className='flex items-center space-x-2 bg-white text-[#0066cc] px-6 py-3 rounded-full hover:shadow-lg font-medium transition'
            >
              <span>Explore Roadmaps</span>
              <ChevronRightIcon className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Statistics Counter - Replaced with static stats */}
      <section className='counter-section section-tight bg-white py-16'>
        <div className='max-w-[980px] mx-auto px-6 md:px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-4xl font-bold text-[#0066cc]'>120+</div>
              <div className='text-lg text-gray-600 mt-2'>Courses</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-[#0066cc]'>150+</div>
              <div className='text-lg text-gray-600 mt-2'>Students</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-[#0066cc]'>8</div>
              <div className='text-lg text-gray-600 mt-2'>Learning Paths</div>
            </div>
            <div className='text-center'>
              <div className='text-4xl font-bold text-[#0066cc]'>92%</div>
              <div className='text-lg text-gray-600 mt-2'>Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id='learning-paths' className='section-full bg-[#f5f5f7] py-20'>
        <div className='max-w-[980px] mx-auto px-6 md:px-4'>
          <h2 className='h2 text-center mb-8'>Choose Your Learning Path</h2>
          <p className='text-[19px] leading-[1.47059] text-[#86868b] max-w-[680px] mx-auto text-center mb-12'>
            Select the learning path that aligns with your career goals and interests. Each path is designed to take you from beginner to proficient.
          </p>
          
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {pathways.map((pathway, index) => (
              <div key={index} className='card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.03]'>
                <div className='p-8'>
                  <div className='w-16 h-16 bg-[#e3efff] rounded-full flex items-center justify-center mb-6'>
                    <Image 
                      src={pathway.icon} 
                      alt={pathway.title} 
                      width={32} 
                      height={32} 
                      className='object-contain' 
                    />
                  </div>
                  <h3 className='text-[24px] font-semibold mb-3 text-[#1d1d1f]'>{pathway.title}</h3>
                  <p className='text-[17px] text-[#86868b] mb-6'>{pathway.description}</p>
                  
                  <div className='flex items-center space-x-2 text-[15px] text-[#86868b] mb-2'>
                    <AcademicCapIcon className='h-5 w-5 text-[#0066cc]' />
                    <span>{pathway.courses} Courses</span>
                  </div>
                  
                  <div className='flex items-center space-x-2 text-[15px] text-[#86868b] mb-6'>
                    <ArrowPathIcon className='h-5 w-5 text-[#0066cc]' />
                    <span>{pathway.duration}</span>
                  </div>
                  
                  <Link 
                    href={`/roadmap/${pathway.id}`}
                    className='flex items-center text-[#0066cc] font-medium hover:underline'
                  >
                    <span>View Pathway</span>
                    <ChevronRightIcon className='h-4 w-4 ml-1' />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web Development Path - Improved Timeline */}
      <section className='section-full bg-white py-20'>
        <div className='max-w-[980px] mx-auto px-6 md:px-4'>
          <h2 className='h2 text-center mb-6'>Web Development Path</h2>
          <p className='text-[19px] leading-[1.47059] text-[#86868b] max-w-[680px] mx-auto text-center mb-12'>
            A step-by-step guide to becoming a full-stack web developer. Learn frontend, backend, and everything in between.
          </p>
          
          <div className='relative'>
            {/* Vertical line for timeline */}
            <div className='absolute left-[15px] md:left-1/2 md:-ml-[2px] top-0 bottom-0 w-[4px] bg-[#e3efff]'></div>
            
            <div className='timeline-wrapper'>
              {webDevSteps.map((step, index) => (
                <div key={index} className={`timeline-item mb-16 relative ${index % 2 === 0 ? 'md:pr-[50%]' : 'md:pl-[50%] md:ml-auto'}`}>
                  <div className={`timeline-content ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} md:w-full pl-16`}>
                    {/* Timeline node with number */}
                    <div className='absolute left-0 md:left-1/2 top-0 transform md:translate-x-[-50%] w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md z-10'>
                      {index + 1}
                    </div>
                    
                    <div className='card bg-white border border-[#e5e5e5] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6'>
                      <div className='flex items-center mb-4'>
                        {index === 0 && <CodeBracketIcon className='h-6 w-6 text-[#0066cc] mr-3' />}
                        {index === 1 && <CommandLineIcon className='h-6 w-6 text-[#0066cc] mr-3' />}
                        {index === 2 && <ServerIcon className='h-6 w-6 text-[#0066cc] mr-3' />}
                        {index === 3 && <CpuChipIcon className='h-6 w-6 text-[#0066cc] mr-3' />}
                        {index === 4 && <WrenchScrewdriverIcon className='h-6 w-6 text-[#0066cc] mr-3' />}
                        <h3 className='text-[22px] font-semibold text-[#1d1d1f]'>{step.title}</h3>
                      </div>
                      
                      <p className='text-[17px] text-[#86868b] mb-5'>{step.description}</p>
                      
                      <div className='mb-5'>
                        <div className='font-medium text-[17px] text-[#1d1d1f] mb-2'>Key skills you&apos;ll learn:</div>
                        <div className='flex flex-wrap gap-2'>
                          {step.skills.map((skill, skillIndex) => (
                            <span key={"skillIndex"} className='inline-block bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium px-3 py-1 rounded-full'>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Link 
                        href={`/courses?category=${step.id}`}
                        className='text-[#0066cc] font-medium hover:underline flex items-center'
                      >
                        <span>View related courses</span>
                        <ChevronRightIcon className='h-4 w-4 ml-1' />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className='section-tight py-20'
               style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)' }}>
        <div className='max-w-[700px] mx-auto px-6 md:px-4 text-center'>
          <h2 className='text-[32px] text-white font-bold mb-6'>Ready to Start Your Learning Journey?</h2>
          <p className='text-[19px] leading-[1.47059] text-white/90 mb-8'>
            Choose a roadmap, follow the path, and transform your career with our structured learning approach.
          </p>
          <div className='flex flex-col sm:flex-row justify-center gap-4'>
            <Link href='/courses' className='bg-white/20 text-white hover:bg-white/30 font-medium py-3 px-6 rounded-full transition-colors'>
              Explore Courses
            </Link>
            <Link href='/signup' className='bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full hover:shadow-lg transition-transform hover:-translate-y-1'>
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Mock data - would typically come from API
const pathways = [
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Learn to build modern, responsive websites and web applications',
    icon: '/images/icons/web-dev.svg',
    courses: 12,
    duration: '6 months'
  },
  // Add other pathways...
];

const webDevSteps = [
  {
    id: 'html-css',
    title: 'HTML & CSS Foundations',
    description: 'Start with the building blocks of the web. Learn how to structure content with HTML and style it with CSS.',
    skills: ['HTML5', 'CSS3', 'Responsive Design', 'Flexbox', 'CSS Grid']
  },
  // Add other web dev steps...
];