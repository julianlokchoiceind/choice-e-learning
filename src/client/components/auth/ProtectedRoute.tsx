'use client';

import { useAuthQuery } from '@/client/hooks/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/shared/types/auth/roles';
import { hasRole } from '@/server/auth/roles';
import { LoadingState } from '@/client/components/common';
import { User } from '@/shared/types/user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protected route component
 * Protects routes that require authentication and specific roles
 */
export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { useGetCurrentUser } = useAuthQuery();
  const router = useRouter();
  
  // Get current user with React Query
  const { 
    data: user, 
    isLoading,
    error 
  } = useGetCurrentUser();
  
  // Determine if user is authenticated
  const isAuthenticated = !!user && !error;

  useEffect(() => {
    // Skip checks while loading
    if (isLoading) return;
    
    // If user is not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If a specific role is required, check if the user has the role
    if (requiredRole && user && !hasRole(user as any, requiredRole)) {
      // Redirect to unauthorized page
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);

  // Show loading indicator while authentication state is being determined
  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <LoadingState variant="page" message="Checking authentication..." />
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }
  
  // If a role is required and the user doesn't have it, don't render children
  if (requiredRole && user && !hasRole(user as any, requiredRole)) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
}