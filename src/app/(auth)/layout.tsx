'use client';

import { ReactNode } from 'react';

// Layout for auth pages: just render children

interface AuthLayoutProps {
  children: ReactNode;
  // showSidebar and hideFooter props are unused here
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return <>{children}</>;
}