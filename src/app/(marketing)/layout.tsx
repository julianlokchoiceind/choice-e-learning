'use client';

import { ReactNode } from 'react';
import Header from '@/client/components/layout/Header';
import Footer from '@/client/components/layout/Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function MarketingLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-[44px]">
        {children}
      </main>
      <Footer />
    </div>
  );
} 