import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Choice E-Learning',
  description: 'Login to your account to access courses, track progress, and more',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 