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
 */
const AppProvider = ({ children, session }: AppProviderProps) => {
  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </SessionProvider>
  );
};

export default AppProvider; 