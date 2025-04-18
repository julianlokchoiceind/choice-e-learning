'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
import { PopularCourse } from '../../../types/course';

interface PopularCoursesSectionProps {
  courses: PopularCourse[];
}

/**
 * Popular courses section for the homepage
 * Displays a list of currently popular courses with student count
 * 
 * @param courses - Array of popular course objects to display
 */
const PopularCoursesSection = ({ courses }: PopularCoursesSectionProps) => {
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

export default PopularCoursesSection;
