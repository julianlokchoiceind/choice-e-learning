"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useSession, signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import Notification from '@/components/ui/Notification';
import { ErrorBoundary } from 'react-error-boundary';

// Simple fallback component when error occurs
const HeaderErrorFallback = () => (
  <header className="bg-[rgba(0,0,0,0.8)] backdrop-blur-md fixed w-full top-0 z-40">
    <div className="max-w-[980px] mx-auto">
      <nav className="flex h-[44px] items-center justify-between px-4 md:px-0">
        <Link href="/" className="text-white text-xl opacity-80 hover:opacity-100 transition-opacity">
          Choice E-Learning
        </Link>
        <div></div> {/* Spacer */}
      </nav>
    </div>
  </header>
);

// Simple header with no authentication controls for loading state
const LoadingHeader = () => (
  <header className="bg-[rgba(0,0,0,0.8)] backdrop-blur-md fixed w-full top-0 z-40">
    <div className="max-w-[980px] mx-auto">
      <nav className="flex h-[44px] items-center justify-between px-4 md:px-0">
        {/* Logo */}
        <Link href="/" className="text-white text-xl opacity-80 hover:opacity-100 transition-opacity">
          Choice E-Learning
        </Link>
        
        {/* Desktop Navigation */}
        <ul className="hidden md:flex h-full">
          {[
            { name: 'Courses', href: '/courses' },
            { name: 'Challenges', href: '/challenges' },
            { name: 'Reviews', href: '/reviews' },
            { name: 'FAQ', href: '/faq' },
            { name: 'Roadmap', href: '/roadmap' },
          ].map((item) => (
            <li key={item.name} className="h-full">
              <Link 
                href={item.href} 
                className="flex h-full items-center px-3 text-white/80 hover:text-white text-xs font-normal transition-colors"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Placeholder for authentication UI with same dimensions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-[50px] h-[26px] bg-gray-800/50 animate-pulse rounded-full"></div>
          <div className="hidden md:block w-[60px] h-[26px] bg-gray-800/50 animate-pulse rounded-full"></div>
        </div>
      </nav>
    </div>
  </header>
);

const Header = () => {
  // Destructure with default empty object to prevent undefined errors
  const { data: session = null, status } = useSession();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Track if component is mounted to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Safely set mounted state after render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      // Show notification immediately before logging out
      setNotification({
        show: true,
        type: 'success',
        message: 'Successfully signed out!'
      });
      
      // Delay the actual logout to ensure notification is seen
      setTimeout(async () => {
        try {
          // Use signOut directly to ensure immediate redirect
          await signOut({ 
            redirect: true, 
            callbackUrl: "/" 
          });
        } catch (signOutError) {
          console.error('Sign out error:', signOutError);
        }
      }, 1500); // 1.5 second delay to show the notification
    } catch (error) {
      console.error('Sign out failed:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Sign out failed. Please try again.'
      });
    }
  };

  // Only check client-side mounting, show auth buttons by default
  // This prevents the delay of loading -> showing buttons
  if (!isMounted) {
    return <LoadingHeader />;
  }

  // Default to unauthenticated state during loading
  // This will show the Sign In/Sign Up buttons immediately
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  
  // Only try to access user properties if we're authenticated
  // Use nullish coalescing for additional safety
  const userName = isAuthenticated && typeof session?.user?.name === 'string' 
    ? session.user.name.split(' ')[0] 
    : 'User';

  return (
    <ErrorBoundary fallback={<HeaderErrorFallback />}>
      {/* Notification */}
      {notification?.show && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
            autoClose={true}
            autoCloseDelay={3000} // Increased to 3 seconds for better visibility
          />
        </div>
      )}

      <header className="bg-[rgba(0,0,0,0.8)] backdrop-blur-md fixed w-full top-0 z-40">
        <div className="max-w-[980px] mx-auto">
          <nav className="flex h-[44px] items-center justify-between px-4 md:px-0">
            {/* Logo */}
            <Link href="/" className="text-white text-xl opacity-80 hover:opacity-100 transition-opacity">
              Choice E-Learning
            </Link>
            
            {/* Desktop Navigation */}
            <ul className="hidden md:flex h-full">
              {[
                { name: 'Courses', href: '/courses' },
                { name: 'Challenges', href: '/challenges' },
                { name: 'Reviews', href: '/reviews' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Roadmap', href: '/roadmap' },
              ].map((item) => (
                <li key={item.name} className="h-full">
                  <Link 
                    href={item.href} 
                    className="flex h-full items-center px-3 text-white/80 hover:text-white text-xs font-normal transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            {/* Right Side Links - with fixed width containers to prevent layout shifts */}
            <div className="flex items-center space-x-4 min-w-[120px] justify-end">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" aria-label="Dashboard" className="text-white/80 hover:text-white transition-colors">
                    <UserIcon className="h-4 w-4" />
                  </Link>
                  <span className="hidden md:block text-white/80 text-xs">
                    {userName}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="hidden md:flex items-center text-white/80 hover:text-white text-xs font-medium transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:block text-white/80 hover:text-white text-xs font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link href="/signup" className="hidden md:block bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={toggleMobileMenu}
                className="md:hidden text-white/80 hover:text-white transition-colors" 
                aria-label="Menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-5 w-5" />
                ) : (
                  <Bars3Icon className="h-5 w-5" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Separate Mobile Menu Component */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40" aria-modal="true" role="dialog">
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black opacity-80"></div>
          
          {/* Menu container */}
          <div 
            className="fixed inset-x-0 top-[44px] bg-gradient-to-b from-[#000428] to-[#004e92]"
            style={{
              height: '480px',
              animation: "slideDown 0.3s ease-in-out forwards",
              zIndex: 1
            }}
          >
            <div className="p-4 h-full overflow-y-auto">
              <nav className="space-y-4">
                <ul className="space-y-4">
                  {[
                    { name: 'Courses', href: '/courses' },
                    { name: 'Challenges', href: '/challenges' },
                    { name: 'Reviews', href: '/reviews' },
                    { name: 'FAQ', href: '/faq' },
                    { name: 'Roadmap', href: '/roadmap' },
                  ].map((item) => (
                    <li key={item.name}>
                      <Link 
                        href={item.href} 
                        className="block text-white text-2xl font-medium hover:text-white/80 transition-colors py-1.5"
                        onClick={toggleMobileMenu}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Authentication Section */}
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-4 py-2">
                    {isAuthenticated ? (
                      <>
                        <Link 
                          href="/dashboard" 
                          className="block text-white text-xl font-medium hover:text-white/80 transition-colors py-2.5 px-6 rounded-full border border-white/20 text-center"
                          onClick={toggleMobileMenu}
                        >
                          Dashboard
                        </Link>
                        <button 
                          onClick={() => {
                            toggleMobileMenu();
                            handleLogout();
                          }}
                          className="w-full block bg-white/10 hover:bg-white/20 text-white text-xl font-medium py-2.5 px-6 rounded-full text-center transition-colors"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/login" 
                          className="block text-white text-xl font-medium hover:text-white/80 transition-colors py-2.5 px-6 rounded-full border border-white/20 text-center"
                          onClick={toggleMobileMenu}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/signup" 
                          className="block bg-white/10 hover:bg-white/20 text-white text-xl font-medium py-2.5 px-6 rounded-full text-center transition-colors"
                          onClick={toggleMobileMenu}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default Header; 