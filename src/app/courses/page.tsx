import { Metadata } from "next";

// Add the keyframes for animations in global CSS
import "@/styles/animations.css";
import Image from 'next/image';
import { CoursesSection } from "@/components/courses";

export const metadata: Metadata = {
  title: "Courses | Choice E-Learning",
  description: "Browse our extensive catalog of online courses to enhance your skills and knowledge.",
};

// Featured courses for the hero section
const featuredCourses = [
  {
    id: 'featured-1',
    title: 'Web Development Masterclass',
    description: 'Learn HTML, CSS, JavaScript, React, and more to become a full-stack web developer',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop'
  },
  {
    id: 'featured-2',
    title: 'Machine Learning Fundamentals',
    description: 'Master the core concepts of machine learning and artificial intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop'
  }
];

// Main courses page component
export default function CoursesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden" 
               style={{ 
                 background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)',
                 paddingTop: '100px',
                 paddingBottom: '60px'
               }}>
        {/* Floating App Icons */}
        <div className="absolute right-0 top-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* React Icon */}
          <div className="absolute w-24 h-24 md:w-32 md:h-32 top-[15%] right-[15%] animate-float-slow opacity-80">
            <Image 
              src="/icons/react.svg" 
              alt="React Icon" 
              width={120} 
              height={120}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* JavaScript Icon */}
          <div className="absolute w-20 h-20 md:w-28 md:h-28 bottom-[20%] right-[20%] animate-float opacity-80">
            <Image 
              src="/icons/javascript.svg" 
              alt="JavaScript Icon" 
              width={100} 
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* TypeScript Icon */}
          <div className="absolute w-16 h-16 md:w-24 md:h-24 top-[25%] right-[38%] animate-float-slow-reverse opacity-80">
            <Image 
              src="/icons/typescript.svg" 
              alt="TypeScript Icon" 
              width={80} 
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Python Icon */}
          <div className="absolute w-24 h-24 md:w-32 md:h-32 bottom-[15%] left-[10%] animate-float-slow-alt opacity-80">
            <Image 
              src="/icons/python.svg" 
              alt="Python Icon" 
              width={120} 
              height={120}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Node.js Icon */}
          <div className="absolute w-20 h-20 md:w-28 md:h-28 top-[30%] left-[20%] animate-float-alt opacity-80 hidden md:block">
            <Image 
              src="/icons/node.svg" 
              alt="Node.js Icon" 
              width={100} 
              height={100}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        
        <div className="relative z-10 max-w-[980px] mx-auto px-6 md:px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-[40px] md:text-[56px] font-bold text-white mb-6 tracking-tight leading-tight">
              Explore Our<br />Online Courses
            </h1>
            <p className="text-[18px] md:text-[21px] text-white/80 mb-8 leading-relaxed">
              Elevate your skills with premium courses taught by industry experts. 
              Learn at your own pace with on-demand video content.
            </p>
          </div>
          
          <div className="md:w-1/2 md:pl-12">
            <div className="relative h-[300px] md:h-[400px] w-full rounded-xl overflow-hidden shadow-2xl transform rotate-2 transition-all">
              <Image
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop"
                alt="Student learning online"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Courses Section with filtering, search, and pagination */}
      <CoursesSection />
    </div>
  );
}