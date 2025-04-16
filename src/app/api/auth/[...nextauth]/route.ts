import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

// Create a handler wrapper to catch errors
const handleAuth = async (req: Request, context: { params: { nextauth: string[] } }) => {
  try {
    // Extract provider from URL if in a callback
    const url = new URL(req.url);
    const callbackCheck = url.pathname.match(/\/api\/auth\/callback\/([\w-]+)/);
    const provider = callbackCheck ? callbackCheck[1] : null;
    
    // Check if this is a signin attempt
    const isSignin = url.pathname.includes('/api/auth/signin/');
    const signinProvider = isSignin ? url.pathname.split('/signin/')[1] : null;
    
    if (provider) {
      console.log(`Processing OAuth callback for provider: ${provider}`);
      // Log important request details that might help diagnose issues
      console.log('Callback URL:', url.toString());
      console.log('Query params:', Object.fromEntries(url.searchParams));
      
      // Special handling for Facebook callbacks
      if (provider === 'facebook') {
        console.log('Facebook callback received:', {
          hasCode: !!url.searchParams.get('code'),
          hasError: !!url.searchParams.get('error'),
          state: url.searchParams.get('state')?.substring(0, 10) + '...',
        });
      }
      
      // Special handling for Microsoft callbacks
      if (provider === 'azure-ad') {
        console.log('Microsoft callback received:', {
          hasCode: !!url.searchParams.get('code'),
          hasError: !!url.searchParams.get('error'),
          state: url.searchParams.get('state')?.substring(0, 10) + '...',
        });
      }
    }
    
    if (signinProvider) {
      console.log(`Processing OAuth signin for provider: ${signinProvider}`);
      
      // Special logging for Facebook and Microsoft signin
      if (signinProvider === 'facebook' || signinProvider === 'azure-ad') {
        console.log(`${signinProvider} signin initiated:`, {
          callbackUrl: url.searchParams.get('callbackUrl'),
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Create and return the NextAuth handler
    const handler = NextAuth(authOptions);
    return handler(req, context);
  } catch (error) {
    console.error('NextAuth handler error:', error);
    // Return a generic error response
    return new Response(JSON.stringify({
      error: 'Authentication error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export { handleAuth as GET, handleAuth as POST };