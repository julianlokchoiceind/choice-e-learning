import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UserCircleIcon, ClockIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { UserIcon, AcademicCapIcon, DevicePhoneMobileIcon, DocumentTextIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Instructor {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  rating: number;
  students: number;
  courses: number;
}

interface Review {
  name: string;
  rating: number;
  avatar: string;
  date: string;
  comment: string;
}

interface Lesson {
  title: string;
  duration: string;
}

interface Module {
  title: string;
  duration: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  level: string;
  price: number;
  duration: string;
  lessonsCount: number;
  totalHours: number;
  lastUpdated: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  learningPoints: string[];
  prerequisites: string[];
  modules: Module[];
  instructor: Instructor;
  reviews: Review[];
}

// Mock course data
const courses = [
  {
    id: "react-masterclass",
    title: "React Masterclass",
    description: "Learn how to build advanced React applications with hooks, context API, Redux, and more. This comprehensive course takes you from the fundamentals to advanced concepts with practical, project-based lessons. You'll build real-world applications that you can add to your portfolio.",
    fullDescription: "React is one of the most popular JavaScript libraries for building user interfaces. In this course, you will gain a deep understanding of React by building several projects with increasing complexity. We'll start with the fundamentals of React and gradually move to advanced topics like state management with Redux, handling side effects, and optimizing performance. By the end of the course, you'll have the skills to build complex, scalable applications in React.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
    level: "Intermediate",
    price: 89.99,
    duration: "8 weeks",
    lessonsCount: 67,
    totalHours: 22.5,
    lastUpdated: "March 2023",
    rating: 4.8,
    reviewsCount: 2547,
    isFeatured: true,
    learningPoints: [
      "Build complex React applications from scratch",
      "Master hooks and functional components",
      "Implement state management with Context API and Redux",
      "Create custom hooks for reusable logic",
      "Optimize React applications for performance",
      "Implement authentication and protected routes",
      "Deploy React applications to production",
      "Use TypeScript with React for type safety"
    ],
    prerequisites: [
      "Basic knowledge of HTML, CSS, and JavaScript",
      "Understanding of ES6 features",
      "No prior React experience needed"
    ],
    modules: [
      {
        title: "React Fundamentals",
        duration: "4h 30m",
        lessons: [
          { title: "Introduction to React", duration: "15:00" },
          { title: "Setting up the development environment", duration: "20:00" },
          { title: "Creating your first React component", duration: "25:00" },
          { title: "Understanding JSX", duration: "18:00" },
          { title: "Props and component communication", duration: "30:00" },
          { title: "State and lifecycle methods", duration: "35:00" },
          { title: "Handling events in React", duration: "28:00" },
          { title: "Conditional rendering", duration: "20:00" },
          { title: "Lists and keys", duration: "25:00" },
          { title: "Forms and controlled components", duration: "34:00" }
        ]
      },
      {
        title: "React Hooks",
        duration: "5h 15m",
        lessons: [
          { title: "Introduction to hooks", duration: "22:00" },
          { title: "useState hook", duration: "35:00" },
          { title: "useEffect hook", duration: "40:00" },
          { title: "useContext hook", duration: "30:00" },
          { title: "useReducer hook", duration: "45:00" },
          { title: "useCallback and useMemo hooks", duration: "38:00" },
          { title: "useRef hook", duration: "25:00" },
          { title: "Custom hooks", duration: "40:00" },
          { title: "Rules of hooks", duration: "15:00" },
          { title: "Converting class components to hooks", duration: "45:00" }
        ]
      },
      {
        title: "State Management",
        duration: "6h 45m",
        lessons: [
          { title: "Introduction to state management", duration: "20:00" },
          { title: "The Context API", duration: "40:00" },
          { title: "Redux fundamentals", duration: "50:00" },
          { title: "Actions, reducers, and the store", duration: "45:00" },
          { title: "Connecting React and Redux", duration: "35:00" },
          { title: "Middleware and Redux Thunk", duration: "50:00" },
          { title: "Redux Toolkit", duration: "55:00" },
          { title: "State management with Zustand", duration: "40:00" },
          { title: "Comparing state management solutions", duration: "30:00" }
        ]
      }
    ],
    instructor: {
      name: "Michael Johnson",
      role: "Senior Frontend Developer",
      bio: "Michael has over 10 years of experience in web development and has worked with React since its early days. He has built applications for startups and Fortune 500 companies, and is passionate about teaching React in a practical, easy-to-understand way.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 4.9,
      students: 15489,
      courses: 7
    },
    reviews: [
      {
        name: "Emma Rodriguez",
        rating: 5,
        avatar: "https://randomuser.me/api/portraits/women/63.jpg",
        date: "2 months ago",
        comment: "This course completely transformed my understanding of React. The projects are practical and the explanations are clear. I landed a job as a React developer just a month after finishing this course!"
      },
      {
        name: "David Kim",
        rating: 4,
        avatar: "https://randomuser.me/api/portraits/men/45.jpg",
        date: "3 months ago",
        comment: "Great course overall. The instructor explains complex concepts in an easy-to-understand way. The only reason I'm not giving 5 stars is that some sections could use a bit more depth."
      },
      {
        name: "Sarah Johnson",
        rating: 5,
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        date: "1 month ago",
        comment: "Absolutely worth every penny! I've taken several React courses and this is by far the most comprehensive. The section on custom hooks was particularly helpful for my work."
      }
    ]
  },
  // Other courses would be defined here in a real app
  {
    id: "node-backend",
    title: "Node.js Backend Development",
    description: "Create scalable backend systems with Node.js, Express, and MongoDB",
    fullDescription: "Master backend development with Node.js in this comprehensive course. You'll learn how to build scalable and secure web applications using Node.js, Express, and MongoDB. Starting with Node.js fundamentals, you'll progress through advanced topics like authentication, real-time communication with WebSockets, and deployment strategies. By the end of this course, you'll be able to architect and implement production-ready backend systems that can handle high traffic and complex business requirements.",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1974&auto=format&fit=crop",
    level: "Advanced",
    price: 99.99,
    duration: "10 weeks",
    lessonsCount: 75,
    totalHours: 25,
    lastUpdated: "February 2023",
    rating: 4.7,
    reviewsCount: 1834,
    isFeatured: true,
    learningPoints: [
      "Build RESTful APIs with Node.js and Express",
      "Work with MongoDB and Mongoose",
      "Implement authentication and authorization",
      "Handle file uploads and processing",
      "Deploy Node.js applications to production",
      "Implement websockets for real-time applications",
      "Test your backend with Jest",
      "Create a CI/CD pipeline for your project"
    ],
    prerequisites: [
      "Basic JavaScript knowledge",
      "Understanding of HTTP and REST",
      "Familiarity with npm and package management"
    ],
    modules: [
      {
        title: "Node.js Fundamentals",
        duration: "5h 30m",
        lessons: [
          { title: "Introduction to Node.js", duration: "25:00" },
          { title: "Node.js modules and npm", duration: "35:00" },
          { title: "Working with files and directories", duration: "40:00" },
          { title: "Asynchronous programming in Node.js", duration: "55:00" },
          { title: "Streams and buffers", duration: "45:00" },
          { title: "Error handling in Node.js", duration: "30:00" }
        ]
      },
      {
        title: "Express.js Framework",
        duration: "6h 15m",
        lessons: [
          { title: "Introduction to Express", duration: "30:00" },
          { title: "Routing in Express", duration: "40:00" },
          { title: "Middleware", duration: "50:00" },
          { title: "Template engines", duration: "35:00" },
          { title: "Error handling middleware", duration: "25:00" },
          { title: "Building RESTful APIs", duration: "55:00" }
        ]
      }
    ],
    instructor: {
      name: "Sarah Wilson",
      role: "Backend Developer & Architect",
      bio: "Sarah has worked as a backend developer for over 8 years, specializing in Node.js applications. She has built and scaled systems that handle millions of users and is passionate about teaching scalable backend development.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 4.8,
      students: 12750,
      courses: 5
    },
    reviews: [
      {
        name: "John Davis",
        rating: 5,
        avatar: "https://randomuser.me/api/portraits/men/22.jpg",
        date: "2 months ago",
        comment: "This course took my backend skills to the next level. The section on authentication and security was particularly valuable."
      },
      {
        name: "Linda Chen",
        rating: 4,
        avatar: "https://randomuser.me/api/portraits/women/33.jpg",
        date: "1 month ago",
        comment: "Great course with practical examples. I would have liked more coverage of microservices architecture, but overall very good."
      }
    ]
  }
] as Course[];

async function getCourse(courseId: string): Promise<Course | undefined> {
  return courses.find(c => c.id === courseId);
}

interface Props {
  params: {
    courseId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CoursePage(props: Props) {
  const course = await getCourse(props.params.courseId);
  
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">Course not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-[#000428] to-[#004e92]">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {course.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-4 text-white/70">
            <span className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              {course.instructor.name}
            </span>
            <span className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              {course.duration}
            </span>
            <span className="flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              {course.level}
            </span>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-[980px] mx-auto px-6 md:px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {course.learningPoints.map((point: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-[#0066cc] mr-2 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-6">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-[#1d1d1f]">
                {course.prerequisites.map((prereq: string, index: number) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>

            {/* Sidebar */}
            <div className="bg-[#f5f5f7] rounded-2xl p-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-[#1d1d1f]">${course.price}</span>
                <p className="text-[#86868b]">Lifetime Access</p>
              </div>
              <button className="w-full bg-[#0066cc] text-white font-medium py-3 px-6 rounded-full hover:bg-[#0077ed] transition-colors mb-4">
                Enroll Now
              </button>
              <button className="w-full bg-white text-[#0066cc] font-medium py-3 px-6 rounded-full border border-[#0066cc] hover:bg-[#f5f5f7] transition-colors">
                Add to Wishlist
              </button>

              <div className="mt-6 space-y-4 text-[#1d1d1f]">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3 text-[#86868b]" />
                  <span>Community support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 