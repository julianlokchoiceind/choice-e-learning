import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { comparePasswords } from '@/utils/auth-utils';
import { getCollection } from '../db';
import { ObjectId } from 'mongodb';

// Define Role enum
export enum Role {
  student = 'student',
  instructor = 'instructor',
  admin = 'admin'
}

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials');
            throw new Error('Email and password are required');
          }

          // Get the users collection
          const usersCollection = await getCollection('users');
          if (!usersCollection) {
            console.error('Failed to get users collection');
            throw new Error('Database connection failed');
          }

          // Find the user by email (case insensitive)
          const user = await usersCollection.findOne({ 
            email: credentials.email.toLowerCase() 
          });

          // If user doesn't exist
          if (!user) {
            console.error('User not found');
            throw new Error('Invalid email or password');
          }

          // Verify the password
          const isPasswordValid = await comparePasswords(credentials.password, user.password);
          if (!isPasswordValid) {
            console.error('Password invalid');
            throw new Error('Invalid email or password');
          }

          console.log('Authentication successful for:', credentials.email);

          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as Role
          };
        } catch (error) {
          console.error('Authentication error:', error);
          // Re-throw to be handled by NextAuth
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add custom user data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom user data to the session
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error(`[NextAuth][Error][${code}]:`, metadata);
    },
    warn: (code) => {
      console.warn(`[NextAuth][Warning][${code}]`);
    },
    debug: (code, metadata) => {
      console.log(`[NextAuth][Debug][${code}]:`, metadata);
    },
  },
};

export default authOptions; 