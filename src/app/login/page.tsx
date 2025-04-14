'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth, LoginCredentials } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Notification from '@/components/ui/Notification';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({...prev, [name]: ''}));
    }
  };
  
  const validateForm = () => {
    // Mark all fields as touched
    setFormTouched({
      email: true,
      password: true,
    });
    
    let newErrors = {
      email: '',
      password: '',
    };
    
    let isValid = true;
    
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
      // Call login function
      const result = await login(formData);
      
      if (result) {
        // Show success notification
        setNotification({
          show: true,
          type: 'success',
          message: 'Successfully logged in! Please wait...'
        });
        
        // Delay redirect to ensure notification is visible
        setTimeout(() => {
          // Redirect will happen via next-auth after this
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      setNotification({
        show: true,
        type: 'error',
        message: (err as Error).message || 'Login failed. Please try again.'
      });
    }
  };
  
  // Handle social login with provider
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
  
  // Show notification when there's an auth error or success message
  useEffect(() => {
    if (error) {
      // Check if this is an actual error or just an informational message
      // We use status code 200 in useAuth.ts to indicate informational messages
      const notificationType = error.status === 200 ? 'success' : 'error';
      
      setNotification({
        show: true,
        type: notificationType,
        message: error.message
      });
    }
    
    // Handle URL query parameters for messages
    const message = searchParams.get('message');
    if (message) {
      setNotification({
        show: true,
        type: 'info',
        message: decodeURIComponent(message)
      });
    }
    
    // Check if user was just registered
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setNotification({
        show: true,
        type: 'success',
        message: 'Your account was created successfully! You can now sign in with your credentials.'
      });
      
      // Pre-fill email from query params if available
      const email = searchParams.get('email');
      if (email) {
        setFormData(prev => ({ ...prev, email }));
      }
    }
  }, [error, searchParams]);
  
  // Pre-fill email if provided as a query param (e.g., from registration)
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);
  
  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Notification */}
      {notification?.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
            autoClose={true}
            autoCloseDelay={4000}
          />
        </div>
      )}
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign up for a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  autoComplete="current-password"
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
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
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
              <span className="sr-only">Sign in with Google</span>
              <FaGoogle className="h-5 w-5 text-red-500" />
            </button>
            
            <button
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
            >
              <span className="sr-only">Sign in with GitHub</span>
              <FaGithub className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 