"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    console.log("Toggle menu, current state:", isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Debug when state changes
  useEffect(() => {
    console.log("Menu state updated:", isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-[rgba(0,0,0,0.8)] backdrop-blur-md fixed w-full top-0 z-50">
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
            
            {/* Right Side Links */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" aria-label="Account" className="text-white/80 hover:text-white transition-colors">
                <UserIcon className="h-4 w-4" />
              </Link>
              <Link href="/login" className="hidden md:block text-white/80 hover:text-white text-xs font-medium transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="hidden md:block bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-1 px-3 rounded-full transition-colors">
                Sign Up
              </Link>
              
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
                
                {/* Sign In/Sign Up Section */}
                <div className="pt-4 border-t border-white/10">
                  <div className="space-y-4 py-2">
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
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 