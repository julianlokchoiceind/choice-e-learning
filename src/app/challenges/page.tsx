'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CodeBracketIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  ClockIcon,
  TagIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { LoadingState } from '@/client/components/common';
import apiClient from '@/client/utils/http/api-client';

export const metadata: Metadata = {
  title: 'Coding Challenges | Choice E-Learning',
  description: 'Test your skills with our coding challenges and compete with other learners.',
};

interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  difficulty: {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
  };
  timeLimit: string;
  participants: number;
  category: string;
  gradient: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
  bgColor: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface LeaderboardEntry {
  name: string;
  username: string;
  avatar: string;
  challengesCompleted: number;
  points: number;
}

export default function ChallengesPage() {
  // Sử dụng React Query thay vì state loading thủ công
  const { data, isLoading, error } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      // Mô phỏng API call
      return new Promise<{categories: Category[], challenges: Challenge[], leaderboard: LeaderboardEntry[]}>((resolve) => {
        setTimeout(() => {
          resolve({
            categories,
            challenges,
            leaderboard
          });
        }, 1000);
      });
    }
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <LoadingState variant="page" message="Loading challenges..." />
    </div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md">
        <p className="font-bold">Error</p>
        <p>{error instanceof Error ? error.message : 'Failed to load challenges'}</p>
      </div>
    </div>;
  }

  const { categories, challenges, leaderboard } = data || { categories: [], challenges: [], leaderboard: [] };
  
  return (
    <div className='container mx-auto px-4 py-16'>
      <div className='text-center mb-12'>
        <h1 className='text-2xl md:text-3xl font-bold mb-4'>Coding Challenges</h1>
        <p className='text-base max-w-2xl mx-auto opacity-80'>
          Put your skills to the test with our interactive coding challenges and compete with other learners.
        </p>
      </div>
      
      {/* Featured Challenge */}
      <div className='mb-16 overflow-hidden rounded-xl relative'>
        <div className='relative h-64 md:h-80'>
          <Image 
            src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' 
            alt='Featured Challenge' 
            fill
            className='object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 mix-blend-multiply'></div>
          <div className='absolute inset-0 flex flex-col justify-center px-6 md:px-12'>
            <div className='bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-xl'>
              <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-4'>
                Featured Challenge
              </span>
              <h2 className='text-2xl md:text-3xl font-bold text-white mb-2'>Build a Real-time Chat Application</h2>
              <p className='text-base text-white/90 mb-4'>Create a functional chat application using WebSockets and React in 48 hours.</p>
              <a href='#' className='inline-flex items-center text-white font-medium hover:underline'>
                Join Challenge <ArrowRightIcon className='w-4 h-4 ml-1' />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Challenge Categories */}
      <div className='mb-12'>
        <h2 className='text-xl md:text-2xl font-bold mb-6'>Challenge Categories</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {categories.map((category, index) => (
            <a 
              key={index} 
              href={`#${category.id}`} 
              className='card p-4 text-center transition-all hover:shadow-lg hover:scale-[1.01] duration-300'
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${category.bgColor}`}>
                <category.icon className='w-6 h-6 text-white' />
              </div>
              <h3 className='text-lg font-medium'>{category.name}</h3>
              <p className='text-sm text-gray-500'>{category.count} challenges</p>
            </a>
          ))}
        </div>
      </div>
      
      {/* Weekly Challenges */}
      <div className='mb-16'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl md:text-2xl font-bold'>Weekly Challenges</h2>
          <a href='#' className='text-blue-600 font-medium flex items-center hover:underline'>
            View All <ArrowRightIcon className='w-4 h-4 ml-1' />
          </a>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {challenges.map((challenge, index) => (
            <div key={index} className='card group overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-300'>
              <div className='relative h-48'>
                <Image 
                  src={challenge.image} 
                  alt={challenge.title}
                  fill
                  className='object-cover transition-transform duration-300'
                />
                <div className={`absolute top-0 left-0 w-full h-full ${challenge.gradient} opacity-60 mix-blend-multiply`}></div>
                <div className='absolute top-4 right-4 bg-white rounded-full p-2'>
                  <TrophyIcon className={`w-5 h-5 ${challenge.difficulty.color}`} />
                </div>
              </div>
              
              <div className='p-5'>
                <div className='flex items-center mb-2'>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${challenge.difficulty.bgColor} ${challenge.difficulty.textColor}`}>
                    {challenge.difficulty.label}
                  </span>
                  <span className='text-xs text-gray-500 ml-auto flex items-center'>
                    <ClockIcon className='w-4 h-4 mr-1' /> {challenge.timeLimit}
                  </span>
                </div>
                
                <h3 className='text-lg font-medium mb-2'>{challenge.title}</h3>
                <p className='text-sm text-gray-600 mb-4'>{challenge.description}</p>
                
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center text-sm text-gray-500'>
                    <UserGroupIcon className='w-4 h-4 mr-1' /> {challenge.participants} participants
                  </div>
                  <div className='flex items-center text-sm text-gray-500'>
                    <TagIcon className='w-4 h-4 mr-1' /> {challenge.category}
                  </div>
                </div>
                
                <a 
                  href='#' 
                  className='block w-full py-2 text-center rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity'
                >
                  Take Challenge
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Leaderboard Section */}
      <div>
        <h2 className='text-xl md:text-2xl font-bold mb-6'>Top Challengers This Month</h2>
        <div className='overflow-hidden rounded-lg border border-gray-200'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Rank</th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>User</th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Challenges Completed</th>
                <th scope='col' className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Points</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {leaderboard.map((entry, index) => (
                <tr key={index} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className={`text-sm font-medium ${index < 3 ? 'text-yellow-600' : 'text-gray-900'}`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10 relative'>
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          fill
                          className='rounded-full object-cover'
                        />
                        {index < 3 && (
                          <div className='absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5'>
                            <TrophyIcon className='w-3 h-3 text-white' />
                          </div>
                        )}
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>{entry.name}</div>
                        <div className='text-sm text-gray-500'>@{entry.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{entry.challengesCompleted}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-bold text-gray-900'>{entry.points.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <section className='mt-16 py-16 px-4 rounded-2xl'
               style={{ background: 'linear-gradient(180deg, #0a84ff 0%, #0060df 100%)' }}>
        <div className='text-center'>
          <h2 className='text-xl md:text-2xl font-bold mb-4 text-white'>Ready to challenge yourself?</h2>
          <p className='text-sm md:text-base text-white/90 mb-8 max-w-2xl mx-auto'>Join our community of coders and test your skills with our weekly challenges.</p>
          <a 
            href='#' 
            className='inline-block px-8 py-3 rounded-lg bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors'
          >
            Start Your First Challenge
          </a>
        </div>
      </section>
    </div>
  );
}

// Mock data
const categories = [
  {
    id: 'frontend',
    name: 'Frontend',
    count: 24,
    bgColor: 'bg-blue-500',
    icon: CodeBracketIcon,
  },
  // Rest of categories...
];

const challenges = [
  {
    id: '1',
    title: 'Netflix Clone Challenge',
    description: 'Build a responsive clone of the Netflix user interface using React.',
    image: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
    difficulty: {
      label: 'Intermediate',
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
    timeLimit: '3 Days',
    participants: 345,
    category: 'Frontend',
    gradient: 'bg-gradient-to-r from-red-600 to-purple-600',
  },
  // Rest of challenges...
];

const leaderboard = [
  {
    name: 'Sarah Johnson',
    username: 'sarahcodes',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    challengesCompleted: 32,
    points: 8750,
  },
  // Rest of leaderboard...
]; 