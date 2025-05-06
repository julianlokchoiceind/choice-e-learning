'use client';

import React from 'react';

/**
 * Global animation styles for floating elements
 * Provides CSS keyframes and animation classes used across the application
 */
const AnimationStyles = () => {
  return (
    <style jsx global>{`
      @keyframes float {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-10px) rotate(2deg); }
      }
      
      @keyframes float-slow {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-15px) rotate(-2deg); }
      }
      
      @keyframes float-alt {
        0%, 100% { transform: translateY(0) rotate(0); }
        50% { transform: translateY(-12px) rotate(3deg); }
      }
      
      .animate-float {
        animation: float 4s ease-in-out infinite;
      }
      
      .animate-float-slow {
        animation: float-slow 6s ease-in-out infinite;
      }
      
      .animate-float-alt {
        animation: float-alt 5s ease-in-out infinite;
      }
    `}</style>
  );
};

export default AnimationStyles;
