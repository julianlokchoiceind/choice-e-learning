import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="relative">
          <div className="text-[180px] font-bold opacity-10 text-gradient gradient-primary leading-none">404</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Page not found</h1>
            <p className="text-xl opacity-70 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-gray-200 font-medium transition-all hover:shadow-lg"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
          
          <Link 
            href="/courses"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-gray-200 font-medium transition-all hover:shadow-lg"
          >
            Browse Courses
          </Link>
        </div>
        
        <div className="mt-16">
          <h2 className="font-medium mb-4">Looking for something specific?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Link 
                key={index}
                href={link.href}
                className="p-3 card text-sm hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const quickLinks = [
  { label: 'JavaScript Courses', href: '/courses?category=javascript' },
  { label: 'React Courses', href: '/courses?category=react' },
  { label: 'Python Courses', href: '/courses?category=python' },
  { label: 'Web Development', href: '/courses?category=web-development' },
  { label: 'Coding Challenges', href: '/challenges' },
  { label: 'Learning Roadmaps', href: '/roadmap' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Support', href: '/support' },
]; 