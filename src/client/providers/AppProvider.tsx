'use client';

import React from 'react';
import QueryProvider from './QueryProvider';
import ToastProvider from './ToastProvider';
import { Session } from 'next-auth';
import SessionProvider from './SessionProvider';

interface AppProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Combined provider that includes all app providers
 * This simplifies the root layout by combining all providers in one component
 * 
 * Providers are ordered according to PRD section 3.6:
 * - QueryProvider (ReactQueryProvider) as the outermost provider
 * - ToastProvider nested inside QueryProvider
 * - SessionProvider for authentication state
 */
const AppProvider = ({ children, session }: AppProviderProps) => {
  return (
    <QueryProvider>
      <ToastProvider>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </ToastProvider>
    </QueryProvider>
  );
};

export default AppProvider; 