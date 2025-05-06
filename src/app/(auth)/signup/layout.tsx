import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Choice E-Learning',
  description: 'Create a new account to start learning with Choice E-Learning',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 