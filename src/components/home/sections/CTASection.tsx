'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Call-to-action section for the homepage
 * Encourages visitors to sign up for the platform
 */
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

export default CTASection;
