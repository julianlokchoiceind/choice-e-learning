'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface AuthLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  hideFooter?: boolean;
}

export function AuthLayout({ children, showSidebar = false, hideFooter = false }: AuthLayoutProps) {
  // AuthLayout implementation
}

export default AuthLayout;