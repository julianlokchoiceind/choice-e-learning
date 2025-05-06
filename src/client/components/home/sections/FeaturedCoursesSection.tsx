'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
import { FeaturedCourse } from '../../../types/course';

interface FeaturedCoursesSectionProps {
  courses: FeaturedCourse[];
}

/**
 * Featured courses section for the homepage
 * Displays a grid of featured courses with images, details, and pricing
 * 
 * @param courses - Array of featured course objects to display
 */
const FeaturedCoursesSection = ({ courses }: FeaturedCoursesSectionProps) => {
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

export default FeaturedCoursesSection;
