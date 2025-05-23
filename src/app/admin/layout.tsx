'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/client/components/admin/AdminSidebar';
import ProtectedRoute from '@/client/components/auth/ProtectedRoute';
import { UserRole } from '@/shared/types/auth/roles';
import { MagnifyingGlassIcon, BellIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Fix hydration mismatch by ensuring we only render on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show a minimal loading state until client-side hydration is complete
  if (!isMounted) {
    return (
      <div className='flex h-screen w-full items-center justify-center bg-slate-50'>
        <div className='h-16 w-16 animate-spin rounded-full border-t-4 border-solid border-indigo-600'></div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div className='flex h-screen bg-gray-50 overflow-hidden'>
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className='flex-1 flex flex-col overflow-hidden bg-white shadow-sm'>
          {/* Header */}
          <header className='bg-white border-b px-6 py-4 shadow-sm z-10'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='relative ml-4 md:ml-6'>
                  <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
                    <MagnifyingGlassIcon className='h-5 w-5 text-gray-400' />
                  </span>
                  <input 
                    className='form-input w-full sm:w-64 rounded-md pl-10 pr-4 py-2 border border-gray-300 focus:border-blue-600 focus:ring-0 focus:outline-none' 
                    type='text' 
                    placeholder='Search...' 
                    id='admin-global-search'
                    name='admin-global-search'
                    autoComplete='off'
                  />
                </div>
              </div>
              <div className='flex items-center space-x-4'>
                <button className='text-gray-500 focus:outline-none'>
                  <BellIcon className='h-6 w-6' />
                </button>
                <div className='relative'>
                  <button className='flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition'>
                    <Image className='h-8 w-8 rounded-full object-cover' src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' alt='User avatar' width={32} height={32} />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className='flex-1 overflow-y-auto p-6 bg-white'>
            {children}
          </main>
          
          {/* Footer */}
          <footer className='bg-white py-4 px-6 border-t'>
            <div className='text-center text-sm text-gray-600'>
              Copyright © Designed & Developed by <a href='https://choiceind.com' className='text-blue-600 hover:underline transition-colors duration-150'>Choiceind.com</a> 2025
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}