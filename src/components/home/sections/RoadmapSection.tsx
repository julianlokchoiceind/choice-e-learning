'use client';

import React from 'react';
import Link from 'next/link';
import { Roadmap } from '../../../types/course';

interface RoadmapSectionProps {
  roadmaps: Roadmap[];
}

/**
 * Learning roadmap section for the homepage
 * Displays an interactive learning path with numbered steps
 * Provides different layouts for mobile and desktop views
 * 
 * @param roadmaps - Array of roadmap step objects to display
 */
const RoadmapSection = ({ roadmaps }: RoadmapSectionProps) => {
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

export default RoadmapSection;
