'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/client/components/layout/Header';
import Footer from '@/client/components/layout/Footer';

type ConditionalLayoutProps = {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();
  
  // Don't show header/footer for route groups or admin pages
  const isAdminPage = /^\/admin/.test(pathname || '');
  
  if (isAdminPage) {
    return (
      <>
        {children}
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default ConditionalLayout; 