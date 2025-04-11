import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  status?: number;
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
        
        // Handle specific status codes
        if (response.status === 409) {
          errorMessage = 'This email is already registered. Please use a different email or try to login.';
        } else if (response.status === 503) {
          errorMessage = 'Cannot connect to the database. Please try again later.';
        } else if (response.status === 400) {
          errorMessage = data.error || 'Invalid form data. Please check your input and try again.';
        }
        
        throw new Error(errorMessage);
      }
      
      // Auto-login after successful registration
      console.log('Registration successful, attempting auto-login');
      
      try {
        const result = await signIn('credentials', {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });
        
        if (result?.error) {
          console.error('Auto-login failed:', result.error);
          // Instead of throwing an error, we'll show a success message for registration
          // and prompt the user to login manually
          setError({
            message: 'Registration successful! Please sign in with your credentials.',
            status: 200 // Using 200 to indicate this is an informational message, not an error
          });
          
          // Redirect to login page after a delay
          setTimeout(() => {
            router.push('/login');
          }, 1500);
          
          return true;
        }
        
        console.log('Auto-login successful, redirecting to dashboard');
        
        // Wait for the session to be updated before redirecting
        // Use a longer timeout to ensure session is properly established
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
        
        return true;
      } catch (loginError) {
        console.error('Error during auto-login:', loginError);
        // Still consider registration successful even if auto-login fails
        setError({
          message: 'Account created successfully! Please log in with your credentials.',
          status: 200
        });
        
        // Redirect to login page
        setTimeout(() => {
          router.push('/login');
        }, 1500);
        
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
        throw new Error(result.error);
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
    isLoading: loading,
    authStatus: status,
    error,
    register,
    login,
    logout,
  };
} 