import React from 'react';
import { Metadata } from "next";
import { CheckCircleIcon, ArrowRightIcon, ChevronRightIcon, CodeBracketIcon, CommandLineIcon, ServerIcon, CpuChipIcon, WrenchScrewdriverIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { AcademicCapIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Learning Roadmap | Choice E-Learning",
  description: "Your step-by-step guide to becoming a professional through our structured learning paths.",
};

// Client component for animation counter
const CounterScript = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const counters = document.querySelectorAll('.counter-value');
          const counterSection = document.querySelector('.counter-section');
          
          const startCounting = () => {
            counters.forEach(counter => {
              const target = parseInt(counter.getAttribute('data-target'), 10);
              const duration = 2000; // ms
              const increment = target / (duration / 16);
              let current = 0;
              
              const updateCounter = () => {
                current += increment;
                const value = Math.min(Math.round(current), target);
                counter.textContent = value.toLocaleString();
                
                if (value < target) {
                  requestAnimationFrame(updateCounter);
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
          
          if (counterSection) {
            observer.observe(counterSection);
          }
        });
        `
      }}
    />
  );
};

export default function RoadmapPage() {
  return (
    <>
      <CounterScript />
      
      {/* Enhanced Hero Section */}
      <section className="page-hero bg-gradient-blue text-white">
        <div className="max-w-[980px] mx-auto px-6 md:px-4 relative z-10 py-16 md:py-24">
          <h1 className="h1 text-white text-center max-w-[720px] mx-auto leading-tight">Start Your Learning Journey With a Clear Path</h1>
          <p className="text-[21px] leading-[1.381] text-white/90 max-w-[680px] mx-auto mt-6 text-center">
            Follow our expertly designed learning roadmaps and achieve your goals with a structured, step-by-step approach
          </p>
          <div className="flex justify-center mt-10">
            <Link 
              href="#learning-paths" 
              className="flex items-center space-x-2 bg-white text-[#0066cc] px-6 py-3 rounded-full hover:shadow-lg font-medium transition-transform hover:-translate-y-1"
            >
              <span>Explore Roadmaps</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Statistics Counter */}
      <section className="counter-section section-tight bg-white py-16">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-[42px] md:text-[56px] font-bold text-[#1d1d1f] counter-value" data-target="120">0</div>
              <div className="text-[17px] text-[#86868b] mt-2">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-[42px] md:text-[56px] font-bold text-[#1d1d1f] counter-value" data-target="15000">0</div>
              <div className="text-[17px] text-[#86868b] mt-2">Students</div>
            </div>
            <div className="text-center">
              <div className="text-[42px] md:text-[56px] font-bold text-[#1d1d1f] counter-value" data-target="8">0</div>
              <div className="text-[17px] text-[#86868b] mt-2">Learning Paths</div>
            </div>
            <div className="text-center">
              <div className="text-[42px] md:text-[56px] font-bold text-[#1d1d1f] counter-value" data-target="92">0</div>
              <div className="text-[17px] text-[#86868b] mt-2">Completion Rate %</div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section id="learning-paths" className="section-full bg-[#f5f5f7] py-20">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <h2 className="h2 text-center mb-8">Choose Your Learning Path</h2>
          <p className="text-[19px] leading-[1.47059] text-[#86868b] max-w-[680px] mx-auto text-center mb-12">
            Select the learning path that aligns with your career goals and interests. Each path is designed to take you from beginner to proficient.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pathways.map((pathway, index) => (
              <div key={index} className="card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="p-8">
                  <div className="w-16 h-16 bg-[#e3efff] rounded-full flex items-center justify-center mb-6">
                    <Image 
                      src={pathway.icon} 
                      alt={pathway.title} 
                      width={32} 
                      height={32} 
                      className="object-contain" 
                    />
                  </div>
                  <h3 className="text-[24px] font-semibold mb-3 text-[#1d1d1f]">{pathway.title}</h3>
                  <p className="text-[17px] text-[#86868b] mb-6">{pathway.description}</p>
                  
                  <div className="flex items-center space-x-2 text-[15px] text-[#86868b] mb-2">
                    <AcademicCapIcon className="h-5 w-5 text-[#0066cc]" />
                    <span>{pathway.courses} Courses</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-[15px] text-[#86868b] mb-6">
                    <ArrowPathIcon className="h-5 w-5 text-[#0066cc]" />
                    <span>{pathway.duration}</span>
                  </div>
                  
                  <Link 
                    href={`/roadmap/${pathway.id}`}
                    className="flex items-center text-[#0066cc] font-medium hover:underline"
                  >
                    <span>View Pathway</span>
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web Development Path - Improved Timeline */}
      <section className="section-full bg-white py-20">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <h2 className="h2 text-center mb-6">Web Development Path</h2>
          <p className="text-[19px] leading-[1.47059] text-[#86868b] max-w-[680px] mx-auto text-center mb-12">
            A step-by-step guide to becoming a full-stack web developer. Learn frontend, backend, and everything in between.
          </p>
          
          <div className="relative">
            {/* Vertical line for timeline */}
            <div className="absolute left-[15px] md:left-1/2 md:-ml-[2px] top-0 bottom-0 w-[4px] bg-[#e3efff]"></div>
            
            <div className="timeline-wrapper">
              {webDevSteps.map((step, index) => (
                <div key={index} className={`timeline-item mb-16 relative ${index % 2 === 0 ? 'md:pr-[50%]' : 'md:pl-[50%] md:ml-auto'}`}>
                  <div className={`timeline-content ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'} md:w-full pl-16`}>
                    {/* Timeline node with number */}
                    <div className="absolute left-0 md:left-1/2 top-0 transform md:translate-x-[-50%] w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md z-10">
                      {index + 1}
                    </div>
                    
                    <div className="card bg-white border border-[#e5e5e5] rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6">
                      <div className="flex items-center mb-4">
                        {index === 0 && <CodeBracketIcon className="h-6 w-6 text-[#0066cc] mr-3" />}
                        {index === 1 && <CommandLineIcon className="h-6 w-6 text-[#0066cc] mr-3" />}
                        {index === 2 && <ServerIcon className="h-6 w-6 text-[#0066cc] mr-3" />}
                        {index === 3 && <CpuChipIcon className="h-6 w-6 text-[#0066cc] mr-3" />}
                        {index === 4 && <WrenchScrewdriverIcon className="h-6 w-6 text-[#0066cc] mr-3" />}
                        <h3 className="text-[22px] font-semibold text-[#1d1d1f]">{step.title}</h3>
                      </div>
                      
                      <p className="text-[17px] text-[#86868b] mb-5">{step.description}</p>
                      
                      <div className="mb-5">
                        <div className="font-medium text-[17px] text-[#1d1d1f] mb-2">Key skills you'll learn:</div>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, skillIndex) => (
                            <span key={skillIndex} className="inline-block bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium px-3 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <Link 
                        href={`/courses?category=${step.id}`}
                        className="text-[#0066cc] font-medium hover:underline flex items-center"
                      >
                        <span>View related courses</span>
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
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
      <section className="section-tight bg-gradient-blue rounded-none py-20">
        <div className="max-w-[700px] mx-auto px-6 md:px-4 text-center">
          <h2 className="text-[32px] text-white font-bold mb-6">Ready to Start Your Learning Journey?</h2>
          <p className="text-[19px] leading-[1.47059] text-white/90 mb-8">
            Choose a roadmap, follow the path, and transform your career with our structured learning approach.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/courses" className="bg-white/20 text-white hover:bg-white/30 font-medium py-3 px-6 rounded-full transition-colors">
              Explore Courses
            </Link>
            <Link href="/signup" className="bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full hover:shadow-lg transition-transform hover:-translate-y-1">
              Get Started Today
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

const pathways = [
  {
    id: "web-development",
    title: "Web Development",
    description: "Learn to build modern, responsive websites and web applications",
    courses: 42,
    duration: "6-8 months",
    icon: "/icons/web-dev.svg",
  },
  {
    id: "data-science",
    title: "Data Science",
    description: "Master data analysis, visualization, and machine learning",
    courses: 38,
    duration: "8-10 months",
    icon: "/icons/data-science.svg",
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    description: "Create native and cross-platform mobile applications",
    courses: 35,
    duration: "6-9 months",
    icon: "/icons/mobile-dev.svg",
  },
];

const webDevSteps = [
  {
    id: "html-css-js",
    title: "HTML, CSS & JavaScript Fundamentals",
    description: "Build a solid foundation with the core technologies of the web. Learn to structure content, style pages, and add interactivity.",
    skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "DOM Manipulation"]
  },
  {
    id: "frontend",
    title: "Frontend Development",
    description: "Master modern frontend frameworks and libraries. Build interactive user interfaces and single-page applications.",
    skills: ["React", "Vue.js", "State Management", "API Integration", "UI/UX Principles"]
  },
  {
    id: "backend",
    title: "Backend Development",
    description: "Learn server-side programming, databases, and API development. Create robust backend systems to power your applications.",
    skills: ["Node.js", "Express", "MongoDB", "SQL", "RESTful APIs", "Authentication"]
  },
  {
    id: "fullstack",
    title: "Full Stack Integration",
    description: "Connect frontend and backend components. Deploy complete web applications and implement advanced features.",
    skills: ["Full Stack Architecture", "Deployment", "Performance Optimization", "Security", "Testing"]
  },
  {
    id: "career-prep",
    title: "Career Preparation & Advanced Topics",
    description: "Prepare for the job market and explore specialized topics in web development to stand out from the crowd.",
    skills: ["Portfolio Building", "Technical Interviews", "DevOps Basics", "GraphQL", "Serverless Architecture"]
  },
]; 