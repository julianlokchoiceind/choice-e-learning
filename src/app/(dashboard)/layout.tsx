'use client';

import { Sidebar } from '@/client/components/layout/Sidebar';
import { useAuth } from '@/client/hooks/auth/useAuth';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  hideFooter?: boolean;
}

export function DashboardLayout({ children, showSidebar = false, hideFooter = false }: DashboardLayoutProps) {
  // DashboardLayout implementation
}

export default DashboardLayout;