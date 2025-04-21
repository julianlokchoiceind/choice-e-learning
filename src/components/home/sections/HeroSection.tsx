'use client';

import React from 'react';
import { AnimationStyles } from '../../ui/animations';

interface HeroSectionProps {
  children: React.ReactNode;
}

/**
 * Hero section component for the homepage
 * Provides a styled container with animation styles for hero content
 * 
 * @param children - Content to display within the hero section
 */
const HeroSection = ({ children }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden" 
             style={{ 
               background: 'linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%)',
               paddingTop: '100px',
               paddingBottom: '80px'
             }}>
      <AnimationStyles />
      {children}
    </section>
  );
};

export default HeroSection;
