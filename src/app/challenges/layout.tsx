import React from 'react';

export const metadata = {
  title: 'Coding Challenges | Choice E-Learning',
  description: 'Enhance your coding skills with our interactive challenges',
};

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='challenges-layout'>
      {children}
    </div>
  );
} 