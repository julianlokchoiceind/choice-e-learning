import React from 'react';
import Link from 'next/link';
import { UserIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Header = () => {
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
            <button className="md:hidden text-white/80 hover:text-white transition-colors" aria-label="Menu">
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 