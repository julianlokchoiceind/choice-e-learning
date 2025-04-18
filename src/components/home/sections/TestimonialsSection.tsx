'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaChevronRight } from 'react-icons/fa';
import { Testimonial } from '../../../types/course';

/**
 * Testimonials section for the homepage
 * Displays student quotes and stories in a horizontally scrolling carousel
 */
const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
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

export default TestimonialsSection;
