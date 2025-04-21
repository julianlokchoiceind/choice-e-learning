'use client';

import React from 'react';
import { HowItWorksStep } from '../../../types/course';

/**
 * How It Works section for the homepage
 * Displays a step-by-step guide for new users on how to use the platform
 */
const HowItWorksSection = () => {
  const steps: HowItWorksStep[] = [
    {
      step: "1",
      title: "Choose Your Path",
      description: "Select from our range of courses based on your goals and experience level"
    },
    {
      step: "2",
      title: "Learn by Building",
      description: "Follow along with video lectures and build real-world projects"
    },
    {
      step: "3",
      title: "Join the Community",
      description: "Connect with other students, get feedback, and share your progress"
    }
  ];

  return (
    <section className="section-tight py-20 md:py-[100px] bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto px-6 md:px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0066cc] text-white flex items-center justify-center text-xl font-semibold mx-auto mb-5">
                {step.step}
              </div>
              <h3 className="text-[21px] leading-[1.381] font-semibold mb-3">{step.title}</h3>
              <p className="text-[14px] leading-[1.42859] text-[#86868b]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
