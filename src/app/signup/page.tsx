'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth, RegisterCredentials } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Notification from '@/components/ui/Notification';

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterCredentials & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: '',
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setAcceptTerms(checked);
      if (checked) {
        setFieldErrors(prev => ({...prev, terms: ''}));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Clear field error when typing
      if (fieldErrors[name as keyof typeof fieldErrors]) {
        setFieldErrors(prev => ({...prev, [name]: ''}));
      }
      
      // Special case for password/confirmPassword matching
      if (name === 'password' && formData.confirmPassword && value !== formData.confirmPassword) {
        setFieldErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
      } else if (name === 'confirmPassword' && formData.password && value !== formData.password) {
        setFieldErrors(prev => ({...prev, confirmPassword: 'Passwords do not match'}));
      } else if ((name === 'password' || name === 'confirmPassword') && 
                formData.confirmPassword && formData.password) {
        setFieldErrors(prev => ({...prev, confirmPassword: ''}));
      }
    }
  };
  
  const validateForm = () => {
    // Mark all fields as touched
    setFormTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    
    let newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    };
    
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
      isValid = false;
    }
    
    // Update all errors at once
    setFieldErrors(newErrors);
    
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Hide any previous notifications
    setNotification(null);
    
    // Validate the form before submitting
    if (!validateForm()) {
      return;
    }
    
    try {
      // Call register function with only the required fields
      const { confirmPassword, ...credentials } = formData;
      const result = await register(credentials);
      
      if (result) {
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: 'Your account was created successfully!',
          details: 'Redirecting to dashboard...'
        });
        
        // The register function in useAuth now handles the redirect to dashboard
      }
    } catch (err) {
      console.error('Registration error:', err);
      setNotification({
        show: true,
        type: 'error',
        message: (err as Error).message || 'Registration failed. Please try again.'
      });
    }
  };
  
  // Show error notification when there's an auth error
  React.useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        type: 'error',
        message: error.message
      });
    }
  }, [error]);

  // Handle social signup/login with provider
  const handleSocialLogin = async (provider: string) => {
    try {
      setNotification({
        show: true,
        type: 'info',
        message: `Signing in with ${provider}...`
      });
      
      await signIn(provider, {
        callbackUrl: '/dashboard',
      });
      
      // Note: The rest of this function might not execute due to page redirect
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setNotification({
        show: true,
        type: 'error',
        message: `${provider} login failed. Please try another method.`
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification?.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Notification
            type={notification.type}
            message={notification.message}
            details={notification.details}
            onClose={() => setNotification(null)}
            autoClose={true}
            autoCloseDelay={3000}
          />
        </div>
      )}
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    fieldErrors.name ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`block w-full appearance-none rounded-md border ${
                    fieldErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={acceptTerms}
                  onChange={handleChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </Link>
                </label>
                {fieldErrors.terms && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Sign up with Google</span>
                <FaGoogle className="h-5 w-5 text-red-500" />
              </button>
              
              <button
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              >
                <span className="sr-only">Sign up with GitHub</span>
                <FaGithub className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 