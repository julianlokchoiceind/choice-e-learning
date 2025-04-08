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
  // Expanded course data to include all courses from the main page
  const allCourses = [
    ...courses,
    {
      id: "fullstack-javascript",
      title: "Full Stack JavaScript Bootcamp",
      description: "Comprehensive course covering frontend and backend development with JavaScript",
      fullDescription: "This intensive bootcamp will take you from beginner to proficient full stack JavaScript developer. You'll learn everything from HTML, CSS, and JavaScript fundamentals to advanced topics like React, Node.js, Express, and MongoDB. Through practical, project-based learning, you'll build multiple real-world applications that demonstrate your full stack capabilities. By the end of this course, you'll have the skills to build complete web applications from scratch.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop",
      level: "All Levels",
      price: 129.99,
      duration: "12 weeks",
      lessonsCount: 85,
      totalHours: 32,
      lastUpdated: "April 2023",
      rating: 4.9,
      reviewsCount: 1248,
      isFeatured: true,
      learningPoints: [
        "Build complete web applications using JavaScript",
        "Master frontend development with HTML, CSS, and React",
        "Create backend APIs with Node.js and Express",
        "Work with MongoDB for database management",
        "Implement authentication and authorization",
        "Deploy full stack applications to production",
        "Develop real-time features with WebSockets",
        "Apply best practices for full stack development"
      ],
      prerequisites: [
        "Basic understanding of HTML and CSS",
        "Familiarity with JavaScript fundamentals",
        "No prior backend experience required"
      ],
      modules: [
        {
          title: "Frontend Foundations",
          duration: "4h 15m",
          lessons: [
            { title: "HTML5 and CSS3 Essentials", duration: "45:00" },
            { title: "JavaScript Fundamentals", duration: "60:00" },
            { title: "DOM Manipulation", duration: "50:00" },
            { title: "Responsive Design Principles", duration: "40:00" }
          ]
        },
        {
          title: "React Frontend Development",
          duration: "7h 30m",
          lessons: [
            { title: "React Fundamentals", duration: "60:00" },
            { title: "Components and Props", duration: "45:00" },
            { title: "State Management", duration: "75:00" },
            { title: "Routing in React", duration: "50:00" },
            { title: "React Hooks", duration: "90:00" },
            { title: "Building a Complete Frontend", duration: "90:00" }
          ]
        },
        {
          title: "Backend Development with Node.js",
          duration: "8h 45m",
          lessons: [
            { title: "Node.js Fundamentals", duration: "60:00" },
            { title: "Express Framework", duration: "70:00" },
            { title: "RESTful API Design", duration: "80:00" },
            { title: "MongoDB Integration", duration: "90:00" },
            { title: "Authentication with JWT", duration: "75:00" },
            { title: "Deployment Strategies", duration: "50:00" }
          ]
        }
      ],
      instructor: {
        name: "David Martinez",
        role: "Full Stack Developer",
        bio: "David has over 12 years of experience in full stack development. He's worked with startups and Fortune 500 companies, helping them build scalable web applications. His teaching approach focuses on practical, real-world applications of programming concepts.",
        avatar: "https://randomuser.me/api/portraits/men/4.jpg",
        rating: 4.9,
        students: 5671,
        courses: 8
      },
      reviews: [
        {
          name: "Jason Lee",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/17.jpg",
          date: "2 months ago",
          comment: "This bootcamp was exactly what I needed to transition into web development. The projects were challenging and relevant, and I learned so much in a short period of time."
        },
        {
          name: "Maria Garcia",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/22.jpg",
          date: "1 month ago",
          comment: "Comprehensive and well-structured course. I especially appreciated the focus on best practices and real-world applications. Worth every penny!"
        },
        {
          name: "Thomas Wilson",
          rating: 4,
          avatar: "https://randomuser.me/api/portraits/men/29.jpg",
          date: "3 months ago",
          comment: "Great content overall. The pace was sometimes challenging, but the instructor was very helpful. I'm now confident in building full stack applications."
        }
      ]
    },
    {
      id: "typescript-fundamentals",
      title: "TypeScript Fundamentals",
      description: "Learn TypeScript to build more robust JavaScript applications",
      fullDescription: "TypeScript has become an essential tool for modern JavaScript development, allowing developers to write more maintainable and error-free code. This course covers everything you need to know about TypeScript, from basic types and interfaces to advanced features like generics and decorators. You'll learn through practical examples how TypeScript can improve your development workflow and help you catch errors before they reach production.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
      level: "Beginner",
      price: 59.99,
      duration: "6 weeks",
      lessonsCount: 42,
      totalHours: 15,
      lastUpdated: "January 2023",
      rating: 4.6,
      reviewsCount: 427,
      isFeatured: false,
      learningPoints: [
        "Understand TypeScript's type system",
        "Work with interfaces, types, and classes",
        "Implement generics for reusable code",
        "Use advanced TypeScript features",
        "Configure TypeScript projects",
        "Integrate TypeScript with frameworks",
        "Migrate JavaScript projects to TypeScript",
        "Apply TypeScript best practices"
      ],
      prerequisites: [
        "Familiarity with JavaScript",
        "Understanding of ES6+ features",
        "Basic command line knowledge"
      ],
      modules: [
        {
          title: "TypeScript Basics",
          duration: "3h 45m",
          lessons: [
            { title: "Introduction to TypeScript", duration: "30:00" },
            { title: "Setting Up Your Environment", duration: "25:00" },
            { title: "Basic Types", duration: "45:00" },
            { title: "Type Annotations and Inference", duration: "40:00" },
            { title: "Functions in TypeScript", duration: "45:00" }
          ]
        },
        {
          title: "Intermediate TypeScript",
          duration: "4h 30m",
          lessons: [
            { title: "Interfaces", duration: "50:00" },
            { title: "Classes and Access Modifiers", duration: "55:00" },
            { title: "Generics", duration: "60:00" },
            { title: "Union and Intersection Types", duration: "45:00" },
            { title: "Type Guards and Type Assertions", duration: "50:00" }
          ]
        },
        {
          title: "Advanced TypeScript",
          duration: "3h 15m",
          lessons: [
            { title: "Decorators", duration: "45:00" },
            { title: "Utility Types", duration: "40:00" },
            { title: "Declaration Files", duration: "35:00" },
            { title: "TypeScript with React", duration: "35:00" },
            { title: "TypeScript with Node.js", duration: "40:00" }
          ]
        }
      ],
      instructor: {
        name: "Jennifer Kim",
        role: "TypeScript Specialist",
        bio: "Jennifer is a TypeScript evangelist with 8 years of experience in frontend development. She's contributed to numerous open-source TypeScript projects and has helped teams at various tech companies adopt TypeScript in their workflows.",
        avatar: "https://randomuser.me/api/portraits/women/42.jpg",
        rating: 4.7,
        students: 1856,
        courses: 4
      },
      reviews: [
        {
          name: "Robert Chen",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/52.jpg",
          date: "1 month ago",
          comment: "Great introduction to TypeScript! The course is well-structured and the examples are practical. I now use TypeScript for all my projects."
        },
        {
          name: "Laura Smith",
          rating: 4,
          avatar: "https://randomuser.me/api/portraits/women/37.jpg",
          date: "2 months ago",
          comment: "Jennifer explains complex concepts in a very understandable way. The section on generics was particularly helpful for my work."
        }
      ]
    },
    {
      id: "nextjs-essential",
      title: "Next.js Essential Training",
      description: "Master Next.js to build SEO-friendly and performant React applications",
      fullDescription: "Next.js has revolutionized React development by providing a framework that handles server-side rendering, routing, and many other complex aspects of modern web applications. This course will teach you everything you need to know to build production-ready applications with Next.js. You'll learn about its unique features like server-side rendering, static site generation, API routes, and more. By the end of this course, you'll be able to create fast, SEO-friendly React applications.",
      image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?q=80&w=1974&auto=format&fit=crop",
      level: "Intermediate",
      price: 79.99,
      duration: "7 weeks",
      lessonsCount: 54,
      totalHours: 18,
      lastUpdated: "May 2023",
      rating: 4.7,
      reviewsCount: 389,
      isFeatured: false,
      learningPoints: [
        "Setup and configure Next.js projects",
        "Implement server-side rendering (SSR)",
        "Build static sites with Static Site Generation (SSG)",
        "Create API routes in Next.js",
        "Implement dynamic routing",
        "Optimize images and performance",
        "Deploy Next.js applications",
        "Implement authentication in Next.js apps"
      ],
      prerequisites: [
        "Solid understanding of React",
        "Familiarity with JavaScript/TypeScript",
        "Basic knowledge of Node.js"
      ],
      modules: [
        {
          title: "Next.js Fundamentals",
          duration: "4h 20m",
          lessons: [
            { title: "Introduction to Next.js", duration: "35:00" },
            { title: "Creating Your First Next.js App", duration: "45:00" },
            { title: "Pages and Routing", duration: "50:00" },
            { title: "Working with Data", duration: "55:00" },
            { title: "Styling in Next.js", duration: "35:00" }
          ]
        },
        {
          title: "Advanced Rendering",
          duration: "5h 10m",
          lessons: [
            { title: "Server-Side Rendering (SSR)", duration: "60:00" },
            { title: "Static Site Generation (SSG)", duration: "55:00" },
            { title: "Incremental Static Regeneration", duration: "50:00" },
            { title: "Dynamic Imports", duration: "45:00" },
            { title: "Custom Document and App", duration: "50:00" }
          ]
        },
        {
          title: "Next.js Features and Deployment",
          duration: "4h 30m",
          lessons: [
            { title: "API Routes", duration: "50:00" },
            { title: "Authentication Strategies", duration: "60:00" },
            { title: "Image Optimization", duration: "40:00" },
            { title: "Environment Variables", duration: "30:00" },
            { title: "Deploying to Vercel", duration: "40:00" },
            { title: "Other Deployment Options", duration: "40:00" }
          ]
        }
      ],
      instructor: {
        name: "Alex Turner",
        role: "Frontend Architect",
        bio: "Alex has specialized in React and Next.js development for the past 5 years. He's built and maintained numerous production Next.js applications and has a deep understanding of performance optimization and best practices.",
        avatar: "https://randomuser.me/api/portraits/men/36.jpg",
        rating: 4.8,
        students: 1542,
        courses: 5
      },
      reviews: [
        {
          name: "Sophia Wang",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/28.jpg",
          date: "1 month ago",
          comment: "This course completely changed how I approach React development. Next.js is amazing, and Alex explains everything so clearly."
        },
        {
          name: "Mohammed Ali",
          rating: 4,
          avatar: "https://randomuser.me/api/portraits/men/43.jpg",
          date: "2 months ago",
          comment: "Great overview of Next.js. I particularly found the sections on SSG and ISR valuable for my e-commerce project."
        }
      ]
    },
    {
      id: "html-css-fundamentals",
      title: "HTML & CSS Fundamentals",
      description: "Start your web development journey with essential HTML and CSS skills",
      fullDescription: "This comprehensive course provides a solid foundation in HTML and CSS, the building blocks of the web. Whether you're a complete beginner or looking to refresh your skills, this course will teach you how to structure web content with HTML and style it beautifully with CSS. Through hands-on projects, you'll gain practical experience creating responsive layouts, forms, and modern designs. By the end of this course, you'll have the skills to build professional, responsive websites from scratch.",
      image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
      level: "Beginner",
      price: 49.99,
      duration: "5 weeks",
      lessonsCount: 38,
      totalHours: 16,
      lastUpdated: "February 2023",
      rating: 4.5,
      reviewsCount: 812,
      isFeatured: false,
      learningPoints: [
        "Structure web content with semantic HTML5",
        "Style web pages using CSS3",
        "Build responsive layouts with Flexbox and Grid",
        "Create forms and validate user input",
        "Implement modern design principles",
        "Optimize websites for accessibility",
        "Use CSS animations and transitions",
        "Apply CSS preprocessors like SASS"
      ],
      prerequisites: [
        "No prior experience required",
        "Basic computer skills",
        "Enthusiasm to learn web development"
      ],
      modules: [
        {
          title: "HTML5 Essentials",
          duration: "5h 15m",
          lessons: [
            { title: "Introduction to HTML", duration: "40:00" },
            { title: "Document Structure", duration: "35:00" },
            { title: "Text Elements", duration: "45:00" },
            { title: "Links and Images", duration: "50:00" },
            { title: "Lists and Tables", duration: "55:00" },
            { title: "Forms and Input Elements", duration: "60:00" },
            { title: "Semantic HTML", duration: "50:00" }
          ]
        },
        {
          title: "CSS Fundamentals",
          duration: "6h 20m",
          lessons: [
            { title: "Introduction to CSS", duration: "45:00" },
            { title: "Selectors and Properties", duration: "50:00" },
            { title: "The Box Model", duration: "40:00" },
            { title: "Typography and Text Styling", duration: "45:00" },
            { title: "Colors and Backgrounds", duration: "40:00" },
            { title: "Layout Basics", duration: "60:00" },
            { title: "Responsive Design Fundamentals", duration: "70:00" }
          ]
        },
        {
          title: "Modern CSS Techniques",
          duration: "4h 25m",
          lessons: [
            { title: "Flexbox Layout", duration: "60:00" },
            { title: "CSS Grid", duration: "65:00" },
            { title: "CSS Variables", duration: "40:00" },
            { title: "Transitions and Animations", duration: "50:00" },
            { title: "CSS Preprocessors", duration: "50:00" }
          ]
        }
      ],
      instructor: {
        name: "Emily Chen",
        role: "Frontend Developer & Designer",
        bio: "Emily combines her background in design with technical expertise in frontend development. With 7 years of experience, she's passionate about teaching beginners the fundamentals of web development in a clear, approachable way.",
        avatar: "https://randomuser.me/api/portraits/women/56.jpg",
        rating: 4.6,
        students: 3975,
        courses: 6
      },
      reviews: [
        {
          name: "Michael Brown",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/39.jpg",
          date: "1 month ago",
          comment: "Perfect course for beginners! I had no experience with coding before, and now I can build responsive websites. Emily's teaching style is very clear and engaging."
        },
        {
          name: "Jessica Taylor",
          rating: 4,
          avatar: "https://randomuser.me/api/portraits/women/12.jpg",
          date: "2 months ago",
          comment: "Great introduction to HTML and CSS. The projects were fun and practical. I would have liked more advanced CSS techniques, but it's excellent for the fundamentals."
        }
      ]
    },
    {
      id: "react-native-mobile",
      title: "React Native for Mobile Development",
      description: "Build cross-platform mobile apps for iOS and Android using React Native",
      fullDescription: "React Native has transformed mobile development by allowing developers to create native apps for both iOS and Android using JavaScript and React. This comprehensive course will teach you how to build professional, cross-platform mobile applications from scratch. You'll learn React Native fundamentals, navigation, state management, and how to access native device features. By the end of this course, you'll have built several real-world mobile apps and be ready to publish to app stores.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=2070&auto=format&fit=crop",
      level: "Advanced",
      price: 109.99,
      duration: "9 weeks",
      lessonsCount: 72,
      totalHours: 28,
      lastUpdated: "April 2023",
      rating: 4.8,
      reviewsCount: 276,
      isFeatured: false,
      learningPoints: [
        "Set up a React Native development environment",
        "Create cross-platform UI components",
        "Implement navigation and routing",
        "Manage state in mobile applications",
        "Access device features (camera, location, etc.)",
        "Connect to APIs and handle data",
        "Optimize performance for mobile devices",
        "Deploy to iOS and Android app stores"
      ],
      prerequisites: [
        "Experience with React.js",
        "Solid JavaScript knowledge",
        "Familiarity with ES6+ features",
        "Basic understanding of mobile development concepts"
      ],
      modules: [
        {
          title: "React Native Fundamentals",
          duration: "6h 30m",
          lessons: [
            { title: "Introduction to React Native", duration: "45:00" },
            { title: "Setting Up Your Environment", duration: "60:00" },
            { title: "Core Components", duration: "70:00" },
            { title: "Styling in React Native", duration: "65:00" },
            { title: "Handling User Input", duration: "55:00" },
            { title: "Lists and Data Display", duration: "65:00" }
          ]
        },
        {
          title: "Navigation and State Management",
          duration: "7h 15m",
          lessons: [
            { title: "Navigation Fundamentals", duration: "60:00" },
            { title: "Stack Navigation", duration: "55:00" },
            { title: "Tab and Drawer Navigation", duration: "65:00" },
            { title: "State Management with Context", duration: "60:00" },
            { title: "Using Redux with React Native", duration: "75:00" },
            { title: "Persistence and Async Storage", duration: "60:00" },
            { title: "Forms and Validation", duration: "60:00" }
          ]
        },
        {
          title: "Native Device Features",
          duration: "5h 45m",
          lessons: [
            { title: "Camera and Image Picker", duration: "65:00" },
            { title: "Geolocation and Maps", duration: "70:00" },
            { title: "Push Notifications", duration: "60:00" },
            { title: "Local Authentication", duration: "50:00" },
            { title: "Accessing Device Sensors", duration: "55:00" },
            { title: "Background Tasks", duration: "45:00" }
          ]
        },
        {
          title: "Deployment and Beyond",
          duration: "4h 30m",
          lessons: [
            { title: "Performance Optimization", duration: "60:00" },
            { title: "Testing React Native Apps", duration: "55:00" },
            { title: "Building for iOS", duration: "65:00" },
            { title: "Building for Android", duration: "65:00" },
            { title: "Publishing to App Stores", duration: "55:00" }
          ]
        }
      ],
      instructor: {
        name: "Marcus Johnson",
        role: "Mobile Developer",
        bio: "Marcus has been developing mobile applications for over 9 years, with the last 5 focused on React Native. He's built and published dozens of apps to the App Store and Google Play, and has worked with startups and enterprises to create successful mobile experiences.",
        avatar: "https://randomuser.me/api/portraits/men/9.jpg",
        rating: 4.9,
        students: 1124,
        courses: 3
      },
      reviews: [
        {
          name: "Alex Zhang",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/62.jpg",
          date: "2 months ago",
          comment: "This course is incredibly thorough. I was able to build and publish my first app within a month of finishing it. Marcus is a fantastic instructor who explains complex concepts clearly."
        },
        {
          name: "Priya Patel",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/women/71.jpg",
          date: "1 month ago",
          comment: "Best React Native course out there! The projects are practical and the explanations are detailed. I especially appreciated the sections on native device features."
        }
      ]
    },
    {
      id: "graphql-api",
      title: "GraphQL API Development",
      description: "Create efficient APIs with GraphQL, Apollo Server, and various databases",
      fullDescription: "GraphQL has emerged as a powerful alternative to REST for API development, offering more flexibility and efficiency. In this advanced course, you'll learn how to design, build, and deploy GraphQL APIs that can work with various data sources. You'll master Apollo Server, schema design, resolvers, authentication, and performance optimization. By the end of this course, you'll be able to create production-ready GraphQL APIs that can serve modern web and mobile applications.",
      image: "https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=2070&auto=format&fit=crop",
      level: "Advanced",
      price: 94.99,
      duration: "8 weeks",
      lessonsCount: 56,
      totalHours: 20,
      lastUpdated: "March 2023",
      rating: 4.6,
      reviewsCount: 321,
      isFeatured: false,
      learningPoints: [
        "Understand GraphQL fundamentals and benefits",
        "Design efficient GraphQL schemas",
        "Build resolvers for various data sources",
        "Implement authentication and authorization",
        "Handle errors and validation",
        "Optimize performance with caching and batching",
        "Deploy GraphQL APIs to production",
        "Test GraphQL APIs effectively"
      ],
      prerequisites: [
        "Experience with Node.js and Express",
        "Understanding of API concepts and REST",
        "Familiarity with JavaScript/TypeScript",
        "Basic database knowledge"
      ],
      modules: [
        {
          title: "GraphQL Fundamentals",
          duration: "4h 45m",
          lessons: [
            { title: "Introduction to GraphQL", duration: "50:00" },
            { title: "GraphQL vs REST", duration: "40:00" },
            { title: "Setting Up Apollo Server", duration: "55:00" },
            { title: "Schema Definition Language", duration: "60:00" },
            { title: "Basic Resolvers", duration: "50:00" }
          ]
        },
        {
          title: "Advanced Schema Design",
          duration: "5h 30m",
          lessons: [
            { title: "Complex Types and Relationships", duration: "65:00" },
            { title: "Input Types and Arguments", duration: "55:00" },
            { title: "Mutations and Subscriptions", duration: "70:00" },
            { title: "Interfaces and Union Types", duration: "60:00" },
            { title: "Schema Stitching and Federation", duration: "70:00" }
          ]
        },
        {
          title: "Data Sources and Integration",
          duration: "5h 15m",
          lessons: [
            { title: "Connecting to SQL Databases", duration: "70:00" },
            { title: "MongoDB Integration", duration: "65:00" },
            { title: "RESTful Data Sources", duration: "60:00" },
            { title: "Microservice Integration", duration: "60:00" },
            { title: "Custom Data Sources", duration: "55:00" }
          ]
        },
        {
          title: "Security and Optimization",
          duration: "4h 30m",
          lessons: [
            { title: "Authentication Strategies", duration: "65:00" },
            { title: "Authorization and Permissions", duration: "60:00" },
            { title: "Error Handling and Logging", duration: "50:00" },
            { title: "Performance Optimization", duration: "55:00" },
            { title: "Caching Strategies", duration: "50:00" }
          ]
        }
      ],
      instructor: {
        name: "Lisa Wong",
        role: "API Architect & Backend Specialist",
        bio: "Lisa has 10 years of experience in backend development, specializing in API design and GraphQL for the last 4 years. She's helped numerous companies transition from REST to GraphQL and has built highly scalable API architectures for enterprises.",
        avatar: "https://randomuser.me/api/portraits/women/24.jpg",
        rating: 4.7,
        students: 945,
        courses: 4
      },
      reviews: [
        {
          name: "James Wilson",
          rating: 5,
          avatar: "https://randomuser.me/api/portraits/men/55.jpg",
          date: "2 months ago",
          comment: "This course completely transformed how I think about API development. Lisa explains complex concepts in a very approachable way. The section on schema design was particularly valuable."
        },
        {
          name: "Anna Kowalski",
          rating: 4,
          avatar: "https://randomuser.me/api/portraits/women/33.jpg",
          date: "3 months ago",
          comment: "Comprehensive coverage of GraphQL. As someone who was already familiar with REST APIs, this course made the transition to GraphQL smooth and logical."
        }
      ]
    }
  ];
  
  return allCourses.find(c => c.id === courseId);
}

export default async function CoursePage({ 
  params 
}: { 
  params: { courseId: string } 
}) {
  const course = await getCourse(params.courseId);
  
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