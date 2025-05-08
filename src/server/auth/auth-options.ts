import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import MicrosoftProvider from 'next-auth/providers/azure-ad';
import { login, getUserByEmail, updateUserRoleAuth } from './services/auth-service';
import prisma from '@/server/db/prisma-client';
import { UserRole } from '@/shared/types/auth/roles';
import { updateLoginStreak } from '@/server/db/services';

// Check if environment variables are set
function validateEnvVariables() {
  const requiredVars = [
    { key: 'NEXTAUTH_SECRET', value: process.env.NEXTAUTH_SECRET },
    { key: 'NEXTAUTH_URL', value: process.env.NEXTAUTH_URL },
    { key: 'FACEBOOK_CLIENT_ID', value: process.env.FACEBOOK_CLIENT_ID },
    { key: 'FACEBOOK_CLIENT_SECRET', value: process.env.FACEBOOK_CLIENT_SECRET },
    { key: 'MICROSOFT_CLIENT_ID', value: process.env.MICROSOFT_CLIENT_ID },
    { key: 'MICROSOFT_CLIENT_SECRET', value: process.env.MICROSOFT_CLIENT_SECRET },
  ];
  
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.map(v => v.key));
  } else {
    console.log('All required environment variables are set');
  }
  
  // Log provider details for debugging
  console.log('OAuth Provider Details:');
  console.log('- Facebook Client ID:', process.env.FACEBOOK_CLIENT_ID?.substring(0, 5) + '...');
  console.log('- Microsoft Client ID:', process.env.MICROSOFT_CLIENT_ID?.substring(0, 5) + '...');
}

// Validate environment variables on startup
validateEnvVariables();

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    id: string;
    role: UserRole;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
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

          // Use the centralized auth service for login
          const result = await login({
            email: credentials.email,
            password: credentials.password
          });

          // If login failed
          if (!result.success || !result.data) {
            console.error('Authentication failed:', result.error?.message);
            throw new Error(result.error?.message || 'Invalid email or password');
          }

          console.log('Authentication successful for:', credentials.email);

          // Return user object from login result
          return {
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            role: result.data.role as UserRole
          };
        } catch (error: unknown) {
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
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    
    // Add GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    
    // Add Facebook Provider
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      version: '12.0', // Set latest API version
      authorization: {
        params: {
          scope: 'email,public_profile',
          display: 'popup',
          auth_type: 'rerequest'
        }
      },
      userinfo: {
        url: 'https://graph.facebook.com/me',
        params: { 
          fields: 'id,name,email,picture' 
        }
      },
      profile(profile) {
        console.log('Facebook profile data:', profile);
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email || `${profile.id}@facebook.com`, // Provide fallback email
          image: profile.picture?.data?.url,
          role: UserRole.STUDENT
        };
      },
      checks: ['state']
    }),
    
    // Add Microsoft Provider (via Azure AD)
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || 'organizations', // Change from 'common' to 'organizations' 
      authorization: {
        params: {
          scope: 'openid profile email User.Read'
        }
      },
      profile(profile) {
        console.log('Microsoft profile data:', profile);
        return {
          id: profile.sub || profile.oid,
          name: profile.name || profile.preferred_username,
          email: profile.email || profile.preferred_username || `${profile.sub || profile.oid}@microsoft.com`, // Provide fallback email
          image: null,
          role: UserRole.STUDENT
        };
      },
      checks: ['pkce', 'state']
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email }) {
      try {
        console.log('SignIn callback triggered:', { 
          provider: account?.provider,
          hasUser: !!user,
          hasProfile: !!profile
        });
        
        // For OAuth providers
        if (account && account.provider && account.provider !== 'credentials') {
          console.log(`OAuth login attempt with ${account.provider}:`, {
            accountType: account.type,
            accountId: account.providerAccountId,
            hasTokens: !!account.access_token
          });
          
          // Special handling for Microsoft provider
          if (account.provider === 'azure-ad') {
            console.log('Microsoft login details:', {
              tokenType: account.token_type,
              scopes: account.scope,
              expiresAt: account.expires_at
            });
          }
          
          // Special handling for Facebook provider
          if (account.provider === 'facebook') {
            console.log('Facebook login details:', {
              tokenType: account.token_type,
              scopes: account.scope,
              expiresAt: account.expires_at
            });
          }
          
          // Validate email presence
          let userEmail = user.email || profile?.email || email;
          if (!userEmail || typeof userEmail !== 'string') {
            console.error('OAuth account missing email:', { 
              provider: account.provider, 
              user,
              profile,
              email 
            });
            // Instead of throwing an error, continue with a generated email
            if (account.provider === 'facebook') {
              user.email = `${user.id}@facebook.com`;
              userEmail = user.email;
              console.log('Using generated email for Facebook:', user.email);
            } else if (account.provider === 'azure-ad') {
              user.email = `${user.id}@microsoft.com`;
              userEmail = user.email;
              console.log('Using generated email for Microsoft:', user.email);
            } else {
              throw new Error('Email is required for authentication');
            }
          }
          
          // Ensure userEmail is a string for database operations
          const normalizedEmail = typeof userEmail === 'string' ? userEmail.toLowerCase() : 
                                 (typeof user.email === 'string' ? user.email.toLowerCase() : '');
          
          // Check if user already exists
          const existingUser = await getUserByEmail(normalizedEmail);
          
          if (existingUser) {
            // User exists, update their OAuth info and login history
            console.log(`Existing user ${normalizedEmail} signed in via ${account.provider}`);
            
            try {
              // Update login history and OAuth info
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  updatedAt: new Date(),
                  name: user.name || existingUser.name,
                  // Note: Add more fields as needed based on your User model
                }
              });
            } catch (updateError: unknown) {
              console.error('Error updating user login history:', updateError);
              // Continue with sign in even if update fails
            }
            
            // Set the user ID for the session
            user.id = existingUser.id;
            user.role = existingUser.role as UserRole;
            
          } else {
            // Create a new user from OAuth data
            console.log(`Creating new user from ${account.provider} OAuth:`, userEmail);
            
            try {
              const newUser = await prisma.user.create({
                data: {
                  name: user.name || profile?.name || 'OAuth User',
                  email: normalizedEmail,
                  password: '', // Empty password for OAuth users
                  role: 'student',
                  // Add other fields as needed
                }
              });
              
              console.log('Created new user from OAuth:', newUser.id);
              user.id = newUser.id;
              user.role = newUser.role as UserRole;
              
            } catch (createError: unknown) {
              console.error('Error creating new user:', createError);
              throw new Error('Failed to create user account');
            }
          }
        } else if (account && account.provider === 'credentials') {
          // For credentials login, check user and update login history
          try {
            if (user.email) {
              const existingUser = await getUserByEmail(user.email);
              if (existingUser) {
                // Update user login info to track streak
                try {
                  await updateLoginStreak(existingUser.id);
                } catch (loginError: unknown) {
                  console.error('Error updating login info:', loginError);
                  // Don't fail login if this fails
                }
                
                // Check and award achievements for login if needed
                try {
                  // We need to dynamically import this to avoid circular dependencies
                  const { checkAndAwardAchievements } = await import('@/server/services/achievements/achievement-service');
                  await checkAndAwardAchievements(existingUser.id);
                } catch (achievementError: unknown) {
                  console.error('Error checking achievements:', achievementError);
                  // Don't fail login if achievements check fails
                }
              }
            }
          } catch (error: unknown) {
            console.error('Error updating login history:', error);
            // Don't prevent login if this fails
          }
        }
        
        return true;
      } catch (error: unknown) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          role: user.role
        };
      }
      return token;
    },
    
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role
        }
      };
    },
    
    async redirect({ url, baseUrl }) {
      // Handle nextauth.js redirects
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
    verifyRequest: '/login',
    newUser: '/dashboard'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
  logger: {
    error: (code, metadata) => {
      if (code !== 'DEBUG_ENABLED') {
        console.error(`[NextAuth][Error][${code}]:`, metadata);
      }
    },
    warn: (code: any) => {
      if (code !== 'DEBUG_ENABLED') {
        console.warn(`[NextAuth][Warning][${code}]`);
      }
    },
    debug: (message: any) => {
      // Only log debug messages in development with DEBUG flag enabled
      if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
        console.log(`[NextAuth][Debug]: ${message}`);
      }
    }
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account?.provider}`, {
        isNewUser,
        userId: user.id
      });
    }
  }
};

export default authOptions;