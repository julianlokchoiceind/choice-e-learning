import React from 'react';

export const metadata = {
  title: 'All Courses | Choice E-Learning',
  description: 'Browse our comprehensive collection of coding and development courses',
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="courses-layout">
      {children}
    </div>
  );
} 