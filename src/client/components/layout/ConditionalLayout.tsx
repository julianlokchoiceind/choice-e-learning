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
  
  // Don't show footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  // Không áp dụng padding-top cho homepage
  const isHomepage = pathname === '/';
  
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
      <main className={`flex-grow ${isHomepage ? '' : 'pt-[44px]'}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}

export default ConditionalLayout; 