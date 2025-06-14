'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, ArrowRightIcon, ChevronRightIcon, CodeBracketIcon, CommandLineIcon, ServerIcon, CpuChipIcon, WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';

// Define interfaces for our data structures
interface Pathway {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  levels: PathwayLevel[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
}

interface PathwayLevel {
  id: string;
  level: number;
  title: string;
  description: string;
  topics: string[];
  duration: string;
  courses: Course[];
  completed?: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  duration: string;
  lessons: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Mock data for pathways
const pathways: Pathway[] = [
  {
    id: '1',
    title: 'Frontend Developer Path',
    description: 'Master modern web development with HTML, CSS, JavaScript, and popular frameworks',
    icon: CodeBracketIcon,
    color: 'blue',
    duration: '6-8 months',
    difficulty: 'beginner',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design'],
    levels: [
      {
        id: '1-1',
        level: 1,
        title: 'Web Fundamentals',
        description: 'Build a strong foundation with HTML, CSS, and basic JavaScript',
        topics: ['HTML5 Semantics', 'CSS Grid & Flexbox', 'JavaScript Basics', 'DOM Manipulation'],
        duration: '4-6 weeks',
        courses: [
          { id: 'c1', title: 'HTML & CSS Masterclass', slug: 'html-css-masterclass', duration: '20 hours', lessons: 45, difficulty: 'beginner' },
          { id: 'c2', title: 'JavaScript Fundamentals', slug: 'javascript-fundamentals', duration: '25 hours', lessons: 60, difficulty: 'beginner' }
        ]
      },
      {
        id: '1-2',
        level: 2,
        title: 'Advanced JavaScript',
        description: 'Deep dive into modern JavaScript and ES6+ features',
        topics: ['ES6+ Features', 'Async Programming', 'Object-Oriented JS', 'Functional Programming'],
        duration: '4-6 weeks',
        courses: [
          { id: 'c3', title: 'Advanced JavaScript Concepts', slug: 'advanced-javascript', duration: '30 hours', lessons: 50, difficulty: 'intermediate' },
          { id: 'c4', title: 'Async JavaScript Mastery', slug: 'async-javascript', duration: '15 hours', lessons: 30, difficulty: 'intermediate' }
        ]
      },
      {
        id: '1-3',
        level: 3,
        title: 'React & Modern Frameworks',
        description: 'Build dynamic applications with React and its ecosystem',
        topics: ['React Fundamentals', 'State Management', 'React Router', 'Next.js'],
        duration: '6-8 weeks',
        courses: [
          { id: 'c5', title: 'React - The Complete Guide', slug: 'react-complete-guide', duration: '40 hours', lessons: 80, difficulty: 'intermediate' },
          { id: 'c6', title: 'Next.js Production Ready', slug: 'nextjs-production', duration: '25 hours', lessons: 45, difficulty: 'advanced' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Backend Developer Path',
    description: 'Learn server-side programming, databases, and API development',
    icon: ServerIcon,
    color: 'green',
    duration: '6-8 months',
    difficulty: 'intermediate',
    skills: ['Node.js', 'Express', 'Databases', 'REST APIs', 'Authentication'],
    levels: [
      {
        id: '2-1',
        level: 1,
        title: 'Server Fundamentals',
        description: 'Understanding servers, HTTP, and basic backend concepts',
        topics: ['HTTP Protocol', 'Server Basics', 'Node.js Introduction', 'npm Ecosystem'],
        duration: '3-4 weeks',
        courses: [
          { id: 'c7', title: 'Node.js Fundamentals', slug: 'nodejs-fundamentals', duration: '20 hours', lessons: 40, difficulty: 'beginner' },
          { id: 'c8', title: 'Express.js Essentials', slug: 'express-essentials', duration: '15 hours', lessons: 30, difficulty: 'intermediate' }
        ]
      },
      {
        id: '2-2',
        level: 2,
        title: 'Database Management',
        description: 'Master both SQL and NoSQL databases',
        topics: ['SQL Fundamentals', 'MongoDB', 'Database Design', 'Query Optimization'],
        duration: '4-5 weeks',
        courses: [
          { id: 'c9', title: 'SQL Mastery', slug: 'sql-mastery', duration: '25 hours', lessons: 50, difficulty: 'intermediate' },
          { id: 'c10', title: 'MongoDB Complete Guide', slug: 'mongodb-guide', duration: '20 hours', lessons: 40, difficulty: 'intermediate' }
        ]
      },
      {
        id: '2-3',
        level: 3,
        title: 'API Development & Security',
        description: 'Build secure, scalable REST and GraphQL APIs',
        topics: ['REST API Design', 'GraphQL', 'Authentication', 'API Security'],
        duration: '5-6 weeks',
        courses: [
          { id: 'c11', title: 'RESTful API Development', slug: 'restful-api', duration: '30 hours', lessons: 55, difficulty: 'intermediate' },
          { id: 'c12', title: 'API Security Best Practices', slug: 'api-security', duration: '20 hours', lessons: 35, difficulty: 'advanced' }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'Full-Stack Developer Path',
    description: 'Combine frontend and backend skills to build complete applications',
    icon: CpuChipIcon,
    color: 'purple',
    duration: '10-12 months',
    difficulty: 'advanced',
    skills: ['Frontend', 'Backend', 'Databases', 'DevOps', 'System Design'],
    levels: [
      {
        id: '3-1',
        level: 1,
        title: 'Full-Stack Foundations',
        description: 'Build your first full-stack applications',
        topics: ['Frontend-Backend Integration', 'Authentication', 'Database Integration', 'Deployment Basics'],
        duration: '6-8 weeks',
        courses: [
          { id: 'c13', title: 'MERN Stack Bootcamp', slug: 'mern-stack', duration: '50 hours', lessons: 100, difficulty: 'intermediate' },
          { id: 'c14', title: 'Full-Stack JavaScript', slug: 'fullstack-javascript', duration: '45 hours', lessons: 90, difficulty: 'intermediate' }
        ]
      },
      {
        id: '3-2',
        level: 2,
        title: 'Advanced Architecture',
        description: 'Design scalable and maintainable applications',
        topics: ['Microservices', 'Design Patterns', 'Testing', 'Performance Optimization'],
        duration: '6-8 weeks',
        courses: [
          { id: 'c15', title: 'Software Architecture', slug: 'software-architecture', duration: '35 hours', lessons: 60, difficulty: 'advanced' },
          { id: 'c16', title: 'Testing Strategies', slug: 'testing-strategies', duration: '25 hours', lessons: 45, difficulty: 'advanced' }
        ]
      },
      {
        id: '3-3',
        level: 3,
        title: 'DevOps & Deployment',
        description: 'Deploy and maintain applications in production',
        topics: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud Platforms'],
        duration: '6-8 weeks',
        courses: [
          { id: 'c17', title: 'DevOps for Developers', slug: 'devops-developers', duration: '40 hours', lessons: 70, difficulty: 'advanced' },
          { id: 'c18', title: 'Cloud Deployment Mastery', slug: 'cloud-deployment', duration: '30 hours', lessons: 55, difficulty: 'advanced' }
        ]
      }
    ]
  }
];

// Mock API function
const fetchRoadmapData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { pathways };
};

export default function RoadmapPage() {
  const [selectedPathway, setSelectedPathway] = useState<Pathway | null>(null);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  // Fetch roadmap data
  const { data, isLoading, error } = useQuery({
    queryKey: ['roadmap'],
    queryFn: fetchRoadmapData,
  });

  // Set default selected pathway
  useEffect(() => {
    if (data?.pathways && !selectedPathway) {
      setSelectedPathway(data.pathways[0]);
    }
  }, [data, selectedPathway]);

  const toggleCourseCompletion = (courseId: string) => {
    setCompletedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleLevelExpansion = (levelId: string) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(levelId)) {
        newSet.delete(levelId);
      } else {
        newSet.add(levelId);
      }
      return newSet;
    });
  };

  const calculatePathwayProgress = (pathway: Pathway) => {
    const totalCourses = pathway.levels.reduce((acc, level) => acc + level.courses.length, 0);
    const completedCount = pathway.levels.reduce(
      (acc, level) => acc + level.courses.filter(course => completedCourses.has(course.id)).length,
      0
    );
    return totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;
  };

  const calculateLevelProgress = (level: PathwayLevel) => {
    const completedCount = level.courses.filter(course => completedCourses.has(course.id)).length;
    return level.courses.length > 0 ? Math.round((completedCount / level.courses.length) * 100) : 0;
  };

  if (isLoading) {
    return <LoadingState message="Loading learning paths..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load roadmap data</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-admin-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Learning Roadmap
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your path and follow our structured curriculum to become a professional developer.
            Track your progress and know exactly what to learn next.
          </p>
        </div>

        {/* Pathway Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Choose Your Path</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.pathways.map((pathway) => {
              const Icon = pathway.icon;
              const progress = calculatePathwayProgress(pathway);
              const isSelected = selectedPathway?.id === pathway.id;

              return (
                <div
                  key={pathway.id}
                  onClick={() => setSelectedPathway(pathway)}
                  className={`
                    relative cursor-pointer rounded-xl border-2 p-6 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                  `}
                >
                  {/* Progress Badge */}
                  {progress > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>{progress}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg bg-${pathway.color}-100`}>
                      <Icon className={`w-8 h-8 text-${pathway.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {pathway.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {pathway.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <AcademicCapIcon className="w-4 h-4 mr-1" />
                          {pathway.duration}
                        </span>
                        <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {pathway.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pathway.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {pathway.skills.length > 3 && (
                      <span className="text-xs px-2 py-1 text-gray-500">
                        +{pathway.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Pathway Details */}
        {selectedPathway && (
          <div className="mt-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedPathway.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  {selectedPathway.description}
                </p>

                {/* Overall Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {calculatePathwayProgress(selectedPathway)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${calculatePathwayProgress(selectedPathway)}%` }}
                    />
                  </div>
                </div>

                {/* Key Skills */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPathway.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Learning Levels */}
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-6">Learning Path</h3>
                
                {selectedPathway.levels.map((level, levelIndex) => {
                  const isExpanded = expandedLevels.has(level.id);
                  const levelProgress = calculateLevelProgress(level);
                  const isCompleted = levelProgress === 100;
                  const isCurrentLevel = levelIndex === 0 || 
                    (levelIndex > 0 && calculateLevelProgress(selectedPathway.levels[levelIndex - 1]) > 0);

                  return (
                    <div key={level.id} className="relative">
                      {/* Connection Line */}
                      {levelIndex < selectedPathway.levels.length - 1 && (
                        <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-300 -z-10" />
                      )}

                      {/* Level Card */}
                      <div className={`
                        border-2 rounded-lg p-6 transition-all
                        ${isCompleted ? 'border-green-500 bg-green-50' : 
                          isCurrentLevel ? 'border-blue-500 bg-blue-50' : 
                          'border-gray-200 bg-white'}
                      `}>
                        {/* Level Header */}
                        <div
                          onClick={() => toggleLevelExpansion(level.id)}
                          className="cursor-pointer flex items-start justify-between"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Level Number */}
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                              ${isCompleted ? 'bg-green-500 text-white' :
                                isCurrentLevel ? 'bg-blue-500 text-white' :
                                'bg-gray-300 text-gray-600'}
                            `}>
                              {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : level.level}
                            </div>

                            {/* Level Info */}
                            <div className="flex-1">
                              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                                {level.title}
                              </h4>
                              <p className="text-gray-600 mb-3">
                                {level.description}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{level.duration}</span>
                                <span>•</span>
                                <span>{level.courses.length} courses</span>
                                <span>•</span>
                                <span>{levelProgress}% complete</span>
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse Icon */}
                          <ChevronRightIcon className={`
                            w-6 h-6 text-gray-400 transition-transform
                            ${isExpanded ? 'rotate-90' : ''}
                          `} />
                        </div>

                        {/* Level Progress */}
                        {levelProgress > 0 && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${levelProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-6 space-y-4">
                            {/* Topics */}
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">Topics Covered:</h5>
                              <div className="flex flex-wrap gap-2">
                                {level.topics.map((topic, index) => (
                                  <span
                                    key={index}
                                    className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Courses */}
                            <div>
                              <h5 className="font-medium text-gray-700 mb-3">Courses:</h5>
                              <div className="space-y-3">
                                {level.courses.map((course) => {
                                  const isCompleted = completedCourses.has(course.id);
                                  
                                  return (
                                    <div
                                      key={course.id}
                                      className={`
                                        flex items-center justify-between p-4 rounded-lg border
                                        ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}
                                      `}
                                    >
                                      <div className="flex items-center space-x-4">
                                        <button
                                          onClick={() => toggleCourseCompletion(course.id)}
                                          className={`
                                            w-6 h-6 rounded border-2 flex items-center justify-center
                                            ${isCompleted 
                                              ? 'bg-green-500 border-green-500' 
                                              : 'border-gray-300 hover:border-gray-400'
                                            }
                                          `}
                                        >
                                          {isCompleted && (
                                            <CheckCircleIcon className="w-4 h-4 text-white" />
                                          )}
                                        </button>

                                        <div>
                                          <h6 className="font-medium text-gray-900">
                                            {course.title}
                                          </h6>
                                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                                            <span>{course.duration}</span>
                                            <span>•</span>
                                            <span>{course.lessons} lessons</span>
                                            <span>•</span>
                                            <span className="capitalize">{course.difficulty}</span>
                                          </div>
                                        </div>
                                      </div>

                                      <Link
                                        href={`/courses/${course.slug}`}
                                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                                      >
                                        View Course
                                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                                      </Link>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Section */}
              <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Ready to Start Your Journey?
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Join thousands of students who are following these proven learning paths
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
                >
                  Get Started Now
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}