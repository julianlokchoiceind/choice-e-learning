"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
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

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 top-[44px] z-40 transform transition-transform duration-500 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div 
          className="h-full w-full bg-gradient-to-b from-[#000428] to-[#004e92] overflow-y-auto"
          style={{ 
            opacity: isMobileMenuOpen ? '1' : '0',
            transition: 'opacity 400ms ease-in-out 100ms'
          }}
        >
          <div className="p-6">
            <nav className="space-y-6">
              <ul className="space-y-6">
                {[
                  { name: 'Courses', href: '/courses' },
                  { name: 'Challenges', href: '/challenges' },
                  { name: 'Reviews', href: '/reviews' },
                  { name: 'FAQ', href: '/faq' },
                  { name: 'Roadmap', href: '/roadmap' },
                ].map((item, index) => (
                  <li 
                    key={item.name}
                    style={{ 
                      animation: isMobileMenuOpen ? `fadeSlideIn 400ms ease-out ${index * 100}ms forwards` : 'none',
                      opacity: 0,
                      transform: 'translateY(10px)'
                    }}
                  >
                    <Link 
                      href={item.href} 
                      className="block text-white text-2xl font-medium"
                      onClick={toggleMobileMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pt-6 border-t border-white/10 space-y-6">
                <Link 
                  href="/login" 
                  className="block text-white text-2xl font-medium"
                  onClick={toggleMobileMenu}
                  style={{ 
                    animation: isMobileMenuOpen ? 'fadeSlideIn 400ms ease-out 600ms forwards' : 'none',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="block bg-white/10 hover:bg-white/20 text-white text-lg font-medium py-2 px-6 rounded-full transition-colors w-full text-center"
                  onClick={toggleMobileMenu}
                  style={{ 
                    animation: isMobileMenuOpen ? 'fadeSlideIn 400ms ease-out 700ms forwards' : 'none',
                    opacity: 0,
                    transform: 'translateY(10px)'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 