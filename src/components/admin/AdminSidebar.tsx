"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

// Add proper slide animation to submenus
const menuVariants = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
};

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  href?: string;
  submenu?: { text: string; href: string }[];
  isActive?: boolean;
  isFirst?: boolean;
}

export default function AdminSidebar() {
  const pathname = usePathname();

  useEffect(() => {
    // Add global CSS to prevent transform on hover
    const style = document.createElement('style');
    style.textContent = `
      .sidebar-menu-item {
        transform: none !important;
      }
      .first-menu-item:hover {
        background-color: rgba(59, 130, 246, 0.6) !important;
        color: white !important;
      }
      .sidebar-menu-item:hover {
        transform: none !important;
        box-shadow: none !important;
        color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Student menu structure
  const studentItems = [
    { text: "All Students", href: "/admin/students" },
    { text: "Add New Student", href: "/admin/students/new" },
  ];
  
  const menuItems: MenuItemProps[] = [
    {
      icon: <HomeIcon className="h-5 w-5" />,
      text: "Dashboard",
      href: "/admin",
      isActive: pathname === '/admin'
    },
    {
      icon: <UserGroupIcon className="h-5 w-5" />,
      text: "Students",
      submenu: studentItems,
      isActive: pathname?.startsWith('/admin/students')
    },
    {
      icon: <BookOpenIcon className="h-5 w-5" />,
      text: "Courses",
      submenu: [
        { text: "All Courses", href: "/admin/courses" },
        { text: "Add New Course", href: "/admin/courses/new" }
      ],
      isActive: pathname?.startsWith('/admin/courses')
    },
    {
      icon: <FolderIcon className="h-5 w-5" />,
      text: "Topics",
      submenu: [
        { text: "All Topics", href: "/admin/topics" },
        { text: "Add New Topic", href: "/admin/topics/new" }
      ],
      isActive: pathname?.startsWith('/admin/topics')
    },
    {
      icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
      text: "FAQs",
      submenu: [
        { text: "All FAQs", href: "/admin/faqs" },
        { text: "Add New FAQ", href: "/admin/faqs/new" }
      ],
      isActive: pathname?.startsWith('/admin/faqs')
    },
    {
      icon: <ChartBarIcon className="h-5 w-5" />,
      text: "Analytics",
      href: "/admin/analytics",
      isActive: pathname?.startsWith('/admin/analytics')
    },
    {
      icon: <DocumentTextIcon className="h-5 w-5" />,
      text: "Quizzes",
      submenu: [
        { text: "All Quizzes", href: "/admin/quizzes" },
        { text: "Create Quiz", href: "/admin/quizzes/new" }
      ],
      isActive: pathname?.startsWith('/admin/quizzes')
    },
    {
      icon: <DocumentCheckIcon className="h-5 w-5" />,
      text: "Certificates",
      submenu: [
        { text: "All Certificates", href: "/admin/certificates" },
        { text: "Create Template", href: "/admin/certificates/template" }
      ],
      isActive: pathname?.startsWith('/admin/certificates')
    },

    {
      icon: <ClockIcon className="h-5 w-5" />,
      text: "Calendar",
      href: "/admin/calendar",
      isActive: pathname?.startsWith('/admin/calendar')
    },
    {
      icon: <BellIcon className="h-5 w-5" />,
      text: "Notifications",
      href: "/admin/notifications",
      isActive: pathname?.startsWith('/admin/notifications')
    },
    {
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      text: "Settings",
      href: "/admin/settings",
      isActive: pathname?.startsWith('/admin/settings')
    }
  ];

  return (
    <div className="w-64 text-white flex flex-col bg-gradient-to-b from-blue-500 via-blue-600 to-blue-800 shadow-lg h-full">
      <div className="p-5 flex items-center border-b border-blue-400/30">
        <div className="mr-3 w-10 h-10 flex-shrink-0">
          <Image 
            src="/images/logos/choiceind logox2.png" 
            alt="Choice Logo" 
            width={40} 
            height={40} 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-white">Administrator</h1>
      </div>
      
      <nav className="flex-1 mt-5">
        <div className="px-4">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <MenuItem 
                key={index}
                icon={item.icon}
                text={item.text}
                href={item.href}
                submenu={item.submenu}
                isActive={item.isActive}
                isFirst={index === 0}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="px-4 py-6">
        <Link
          href="/admin/help"
          className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 rounded-lg shadow-md mb-4 transition-all duration-200 transform hover:scale-[1.02] border border-blue-400/20"
        >
          <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-white" />
          <span className="font-semibold text-white">Help Desk</span>
        </Link>
      </div>

      <div className="border-t border-blue-400/30 mt-auto">
        <div className="px-5 py-4 text-center">
          <p className="text-sm text-blue-100">Administrator Dashboard</p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon, text, href, submenu, isActive = false, isFirst = false }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (submenu) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="mb-1">
      {submenu ? (
        <button
          onClick={toggleSubmenu}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium sidebar-menu-item ${isFirst ? 'first-menu-item' : ''} ${
            isActive 
              ? 'bg-blue-700/70 text-white' 
              : 'text-white hover:bg-blue-500/60 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{icon}</span>
            <span>{text}</span>
          </div>
          <span className={isOpen ? 'rotate-180' : ''}>
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </button>
      ) : (
        <Link
          href={href || "#"}
          className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium sidebar-menu-item ${isFirst ? 'first-menu-item' : ''} ${
            isActive 
              ? 'bg-blue-700/70 text-white' 
              : 'text-white hover:bg-blue-500/60 hover:text-white'
          }`}
        >
          <div className="flex items-center">
            <span className="mr-3">{icon}</span>
            <span>{text}</span>
          </div>
        </Link>
      )}

      {submenu && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={menuVariants}
            >
              <div className="pl-10 space-y-1">
                {submenu.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-blue-500/50 rounded-md sidebar-menu-item"
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}