'use client';

import React from 'react';
import QueryProvider from './QueryProvider';
import ToastProvider from './ToastProvider';
import { Session } from 'next-auth';
import SessionProvider from './SessionProvider';

interface AppProviderProps {
  children: React.ReactNode;
  session?: Session | null;
  enableDevTools?: boolean;
  initialIsOpen?: boolean;
  position?: 'bottom' | 'top' | 'left' | 'right';
}

/**
 * Combined provider that includes all app providers
 * This simplifies the root layout by combining all providers in one component
 * 
 * Providers are ordered according to PRD section 3.6:
 * - QueryProvider (ReactQueryProvider) as the outermost provider
 * - ToastProvider nested inside QueryProvider
 * - SessionProvider for authentication state
 * 
 * DevTools Configuration:
 * - enableDevTools: Enable/disable React Query DevTools (default: true in development)
 * - initialIsOpen: Whether DevTools should be open by default (default: false)
 * - position: Position of the DevTools panel ('bottom', 'top', 'left', 'right')
 */
const AppProvider = ({
  children,
  session,
  enableDevTools = process.env.NODE_ENV === 'development',
  initialIsOpen = false,
  position = 'bottom'
}: AppProviderProps) => {
  return (
    <QueryProvider
      enableDevTools={enableDevTools}
      initialIsOpen={initialIsOpen}
      position={position}
    >
      <ToastProvider>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </ToastProvider>
    </QueryProvider>
  );
};

export default AppProvider; 