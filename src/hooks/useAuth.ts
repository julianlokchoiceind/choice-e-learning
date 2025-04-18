import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AuthError } from '@/lib/auth/services/auth-service';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<AuthError | null>(null);
  const router = useRouter();

  // Clear any error when auth status changes
  useEffect(() => {
    if (error) setError(null);
  }, [status]);

  /**
   * Register a new user
   * @param credentials Registration credentials
   * @returns Success status
   */
  const register = async (credentials: RegisterCredentials) => {
    console.log('Registering user:', credentials.email);
    setLoading(true);
    setError(null);
    
    try {
      // Call the register API endpoint
      console.log('Calling register API with:', { ...credentials, password: '******' });
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      console.log('Register API response:', data);
      
      if (!response.ok) {
        console.error('Registration failed:', data);
        
        // Prepare a user-friendly error message
        let errorMessage = data.error || 'Registration failed';
        let errorStatus = response.status;
        
        // Set appropriate error
        setError({ 
          message: errorMessage,
          status: errorStatus
        });
        
        return false;
      }
      
      // Auto-login after successful registration using the same approach as OAuth providers
      console.log('Registration successful, attempting auto-login');
      
      try {
        // Use callbackUrl and redirect: true to ensure consistent behavior with OAuth
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          callbackUrl: '/dashboard',
          redirect: true,
        });
        
        // Due to the redirect: true, code below this point won't execute
        // But we'll keep it as a fallback
        
        if (result?.error) {
          console.error('Auto-login failed:', result.error);
          throw new Error('Auto-login failed: ' + result.error);
        }
        
        console.log('Auto-login successful');
        router.push('/dashboard');
        return true;
      } catch (loginError) {
        // This catch block is unlikely to execute due to redirect: true
        console.error('Error during auto-login:', loginError);
        
        // If auto-login fails, redirect to login page with a success message
        setError({
          message: 'Account created successfully! Please log in with your credentials.',
          status: 200
        });
        
        router.push(`/login?registered=true&email=${encodeURIComponent(credentials.email)}`);
        return true;
      }
    } catch (err) {
      console.error('Registration process error:', err);
      const errorMessage = (err as Error).message || 'An unknown error occurred';
      setError({ 
        message: errorMessage,
        status: 400
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in an existing user
   * @param credentials Login credentials
   * @returns Success status
   */
  const login = async (credentials: LoginCredentials) => {
    console.log('Logging in user:', credentials.email);
    setLoading(true);
    setError(null);
    
    try {
      console.log('Calling Next-Auth signIn');
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });
      
      console.log('SignIn result:', result);
      
      if (result?.error) {
        console.error('Login failed:', result.error);
        setError({ 
          message: result.error,
          status: 401
        });
        return false;
      }
      
      console.log('Login successful, redirecting to dashboard');
      
      // Force a navigation to the dashboard
      router.push('/dashboard');
      
      return true;
    } catch (err) {
      console.error('Login process error:', err);
      const errorMessage = (err as Error).message || 'Invalid email or password';
      setError({ 
        message: errorMessage,
        status: 401
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out the current user
   * @returns Success status and message
   */
  const logout = async () => {
    console.log('Logging out user');
    setLoading(true);
    try {
      await signOut({ redirect: false });
      console.log('Logout successful, redirecting to home');
      router.push('/');
      return { success: true, message: 'Successfully logged out!' };
    } catch (err) {
      console.error('Logout error:', err);
      setError({ 
        message: (err as Error).message,
        status: 500
      });
      return { success: false, message: 'Logout failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  return {
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: loading || status === 'loading',
    authStatus: status,
    error,
    register,
    login,
    logout,
  };
}