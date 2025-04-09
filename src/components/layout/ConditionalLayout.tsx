"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type ConditionalLayoutProps = {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname();
  
  // Don't show footer on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  
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
      <main className="flex-grow pt-[44px]">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default ConditionalLayout; 