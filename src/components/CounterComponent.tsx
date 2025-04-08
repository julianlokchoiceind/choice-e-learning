'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CounterComponentProps {
  target: number;
  label: string;
}

export default function CounterComponent({ target, label }: CounterComponentProps) {
  const [value, setValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Create intersection observer to detect when counter is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  // Handle counter animation after element is visible
  useEffect(() => {
    if (!isVisible || hasAnimated.current) return;

    hasAnimated.current = true;
    let start = 0;
    const duration = 2000; // ms
    const step = 16; // ~60fps
    const increment = target / (duration / step);

    const updateCounter = () => {
      start += increment;
      const current = Math.min(Math.round(start), target);
      setValue(current);
      
      if (current < target) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isVisible, target]);

  return (
    <div ref={counterRef}>
      <div className="text-[42px] md:text-[56px] font-bold text-[#1d1d1f]">
        {value.toLocaleString()}
      </div>
      <div className="text-[17px] text-[#86868b] mt-2">{label}</div>
    </div>
  );
} 