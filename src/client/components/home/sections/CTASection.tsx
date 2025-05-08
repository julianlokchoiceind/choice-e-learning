'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Call-to-action section for the homepage
 * Encourages visitors to sign up for the platform
 */
const CTASection = () => {
  return (
    <section className='py-16 md:py-20'>
      <div className='max-w-[980px] mx-auto px-6 md:px-4'>
        <div className='text-center rounded-2xl p-10'
             style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)' }}>
          <h2 className='text-[32px] font-semibold mb-6 text-white'>Ready to start your coding journey?</h2>
          <p className='mb-8 text-lg text-white/80 max-w-2xl mx-auto'>
            Join thousands of students who have already taken the first step toward becoming a developer
          </p>
          <Link href='/signup' 
            className='inline-block px-8 py-4 rounded-full bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors'>
            Get started today
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
