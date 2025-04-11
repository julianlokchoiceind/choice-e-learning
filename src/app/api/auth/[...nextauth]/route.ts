import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Simple NextAuth configuration export for App Router
// This removes the need for any complex error handling wrapper
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };