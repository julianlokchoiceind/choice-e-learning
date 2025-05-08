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
  const isAdminPage = pathname?.startsWith('/admin');
  const isRouteGroup = 
    pathname?.startsWith('/(auth)') || 
    pathname?.startsWith('/(dashboard)') || 
    pathname?.startsWith('/(marketing)');
  
  // Don't apply padding-top for homepage
  const isHomepage = pathname === '/';
  
  if (isAdminPage || isRouteGroup) {
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