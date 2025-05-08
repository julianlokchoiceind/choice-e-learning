'use client';

import { ReactNode } from 'react';
import Header from '@/client/components/layout/Header';
import Footer from '@/client/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}