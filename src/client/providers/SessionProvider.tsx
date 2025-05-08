'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import React from 'react';

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * App-wide authentication session provider
 * Bọc toàn bộ app để cung cấp context session cho next-auth
 */
const SessionProvider = ({ children, session }: SessionProviderProps) => {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
};

export default SessionProvider; 