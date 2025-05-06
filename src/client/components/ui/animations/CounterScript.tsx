'use client';

import React from 'react';

/**
 * Client component that provides animation for number counters
 * Automatically animates elements with the 'animate-counter' class when they become visible
 */
const CounterScript = () => {
  return (
    <script dangerouslySetInnerHTML={{
      __html: `
        document.addEventListener('DOMContentLoaded', () => {
          const statsContainers = document.querySelectorAll('.stats-container');
          const animateCounters = function() {
            statsContainers.forEach(container => {
              const rect = container.getBoundingClientRect();
              const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;
              
              if (isVisible) {
                container.classList.add('visible');
                const counters = container.querySelectorAll('.animate-counter');
                counters.forEach(counter => {
                  const target = parseInt(counter.getAttribute('data-target'));
                  const duration = 1500;
                  const start = 0;
                  const increment = Math.ceil(target / (duration / 50));
                  let current = start;
                  
                  const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                      counter.textContent = current;
                      setTimeout(updateCounter, 50);
                    } else {
                      counter.textContent = target.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",");
                    }
                  };
                  
                  updateCounter();
                });
              }
            });
          };
          
          // Run once on load
          animateCounters();
          
          // Add event listener for scroll
          window.addEventListener('scroll', animateCounters);
        });
      `
    }} />
  );
};

export default CounterScript;
