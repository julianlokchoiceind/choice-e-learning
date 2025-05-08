'use client';

import { useAuth } from '@/client/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/shared/types/auth/roles';
import { hasRole } from '@/server/auth/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protected route component
 * Protects routes that require authentication and specific roles
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip checks while loading
    if (isLoading) return;
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If a specific role is required, check if the user has the role
    if (requiredRole && !hasRole(user, requiredRole)) {
      // Redirect to unauthorized page
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500'></div>
          <p className='mt-2 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }
  
  // If a role is required and the user doesn't have it, don't render children
  if (requiredRole && !hasRole(user, requiredRole)) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}