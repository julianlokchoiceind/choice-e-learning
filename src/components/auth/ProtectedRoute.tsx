'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication state is loaded and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    // If a specific role is required, check if the user has the role
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      // Redirect to unauthorized page or dashboard
      router.push('/unauthorized');
    }
  }, [isLoading, isAuthenticated, user, router, requiredRole]);

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the children
  if (!isAuthenticated) {
    return null;
  }
  
  // If a role is required and the user doesn't have it, don't render the children
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  // Otherwise, render the children
  return <>{children}</>;
} 