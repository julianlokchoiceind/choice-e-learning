import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { comparePasswords } from '@/utils/auth-utils';
import { getCollection } from '../db/mongodb';
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
    
    // Add Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    
    // Add GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      const usersCollection = await getCollection('users');
      
      try {
        // For OAuth providers
        if (account && account.provider && account.provider !== 'credentials') {
          if (!user.email) {
            console.error('OAuth account missing email');
            return false;
          }
          
          // Check if user already exists
          const existingUser = await usersCollection.findOne({ email: user.email });
          
          if (existingUser) {
            // User exists, update their OAuth info and login history
            console.log(`Existing user ${user.email} signed in via ${account.provider}`);
            
            // Update login history
            await usersCollection.updateOne(
              { _id: existingUser._id },
              { 
                $set: { 
                  lastLogin: new Date(),
                  authProvider: account.provider,
                },
                $addToSet: { "loginHistory": new Date() }
              }
            );
            
          } else {
            // Create a new user from OAuth data
            console.log(`Creating new user from ${account.provider} OAuth:`, user.email);
            
            const now = new Date();
            const result = await usersCollection.insertOne({
              name: user.name || 'OAuth User',
              email: user.email,
              image: user.image || null,
              role: Role.student, // Default role for OAuth users
              password: null, // OAuth users don't have passwords
              createdAt: now,
              updatedAt: now,
              lastLogin: now,
              loginHistory: [now],
              authProvider: account.provider,
            });
            
            if (!result.acknowledged) {
              console.error('Failed to create user from OAuth');
              return false;
            }
            
            console.log('Created new user from OAuth:', result.insertedId.toString());
            
            // Update user ID to match the newly created user
            user.id = result.insertedId.toString();
          }
        } else if (account && account.provider === 'credentials') {
          // For credentials login, update login history
          try {
            const existingUser = await usersCollection.findOne({ email: user.email });
            if (existingUser) {
              await usersCollection.updateOne(
                { _id: existingUser._id },
                { 
                  $set: { lastLogin: new Date() },
                  $addToSet: { "loginHistory": new Date() }
                }
              );
              
              // Check and award achievements for login
              try {
                // We need to dynamically import this to avoid circular dependencies
                const { checkAndAwardAchievements } = await import('@/services/achievements');
                await checkAndAwardAchievements(existingUser._id.toString());
              } catch (achievementError) {
                console.error('Error checking achievements:', achievementError);
                // Don't fail login if achievements check fails
              }
            }
          } catch (error) {
            console.error('Error updating login history:', error);
            // Don't prevent login if this fails
          }
        }
        
        return true;
      } catch (error) {
        console.error('Error in signIn callback:', error);
        // If there's an error, we'll still allow sign in in most cases
        // to avoid locking users out
        return true;
      }
    },
    
    async jwt({ token, user, account }) {
      // Add custom user data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role || Role.student; // Default role if not present
        
        // If coming from OAuth and we don't have role info yet, fetch from DB
        if (account && account.provider && account.provider !== 'credentials' && !user.role) {
          try {
            const usersCollection = await getCollection('users');
            const dbUser = await usersCollection.findOne({ email: user.email });
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role || Role.student;
            }
          } catch (error) {
            console.error('Error fetching user role from DB:', error);
          }
        }
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