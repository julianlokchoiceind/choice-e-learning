import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircleIcon, UserCircleIcon, ClockIcon, BookOpenIcon, StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

type CourseParams = {
  params: {
    courseId: string;
  };
};

export default function CourseDetailPage({ params }: CourseParams) {
  // In a real app, we would fetch the course data from an API 
  // based on the courseId from the URL params
  const courseId = params.courseId;
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="mb-8">The course you're looking for doesn't exist or has been removed.</p>
        <Link href="/courses" className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Course Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 bg-indigo-900">
        <Image 
          src={course.image}
          alt={course.title}
          fill
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white mb-6">
                <span className="flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-1" />
                  {course.instructor.name}
                </span>
                <span className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-1" />
                  {course.duration}
                </span>
                <span className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 mr-1" />
                  {course.lessonsCount} lessons
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  Last updated {course.lastUpdated}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <StarIcon 
                    key={i} 
                    className={`h-5 w-5 ${i < course.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="text-white ml-2">{course.rating.toFixed(1)} ({course.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* About This Course */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <h3 className="text-xl font-bold mb-4">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {course.learningPoints.map((point, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-4">Prerequisites</h3>
              <ul className="list-disc list-inside mb-6 text-gray-700">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </section>

            {/* Course Content */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Course Content</h2>
              <div className="bg-gray-50 p-4 mb-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{course.lessonsCount} lessons</span>
                    <span className="mx-2">•</span>
                    <span>{course.totalHours} total hours</span>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                    Expand All
                  </button>
                </div>
              </div>

              <div className="border rounded-md divide-y">
                {course.modules.map((module, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex justify-between items-center cursor-pointer">
                      <h3 className="font-medium">{module.title}</h3>
                      <div className="text-sm text-gray-600">
                        {module.lessons.length} lessons • {module.duration}
                      </div>
                    </div>
                    <div className="mt-4 pl-4 space-y-3">
                      {module.lessons.map((lesson, lessonIdx) => (
                        <div key={lessonIdx} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <PuzzlePieceIcon className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-gray-700">{lesson.title}</span>
                          </div>
                          <span className="text-gray-500 text-sm">{lesson.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{course.instructor.name}</h3>
                  <p className="text-gray-600 mb-2">{course.instructor.role}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      {course.instructor.rating} Instructor Rating
                    </span>
                    <span className="flex items-center">
                      <UserCircleIcon className="h-4 w-4 mr-1" />
                      {course.instructor.students.toLocaleString()} Students
                    </span>
                    <span className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      {course.instructor.courses} Courses
                    </span>
                  </div>
                  <p className="text-gray-700">{course.instructor.bio}</p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Student Reviews</h2>
                <Link href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  See all reviews
                </Link>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="md:w-1/3 bg-gray-50 p-6 rounded-md text-center">
                  <div className="text-5xl font-bold text-indigo-600 mb-2">{course.rating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <StarIcon 
                        key={i} 
                        className={`h-5 w-5 ${i < course.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600">Course Rating</p>
                </div>
                
                <div className="md:w-2/3">
                  {course.reviews.map((review, idx) => (
                    <div key={idx} className={`${idx !== 0 ? 'border-t pt-4' : ''} mb-4`}>
                      <div className="flex items-center mb-2">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                          <Image
                            src={review.avatar}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium">{review.name}</h4>
                          <div className="flex items-center">
                            {Array(5).fill(0).map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="bg-white border rounded-lg shadow-sm p-6 sticky top-20">
              <div className="text-3xl font-bold mb-4">${course.price}</div>
              
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-colors mb-3">
                Enroll Now
              </button>
              
              <button className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-4 rounded-md transition-colors mb-6">
                Add to Wishlist
              </button>
              
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3">This course includes:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <BookOpenIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{course.lessonsCount} lessons</span>
                  </li>
                  <li className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span>{course.totalHours} hours of video</span>
                  </li>
                  <li className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Full lifetime access</span>
                  </li>
                  <li className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Access on mobile and TV</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Not sure? All courses have a 30-day money-back guarantee</p>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Gift this course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock data for course details
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
]; 