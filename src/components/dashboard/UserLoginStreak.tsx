import React from 'react';
import { useUserState } from '@/client/hooks/user/useUserState';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FireIcon } from '@heroicons/react/24/solid';

/**
 * UserLoginStreak Component - Displays the user's current login streak
 */
export const UserLoginStreak: React.FC = () => {
  const { loginStreak, hasLoginStreak, loading } = useUserState();
  
  if (loading) {
    return (
      <div className="flex items-center p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (!hasLoginStreak) {
    return null;
  }
  
  return (
    <div className="flex items-center p-4 bg-orange-50 border border-orange-100 rounded-lg">
      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mr-3">
        {loginStreak >= 7 ? (
          <FireIcon className="h-6 w-6 text-orange-500" />
        ) : (
          <CalendarIcon className="h-6 w-6 text-orange-500" />
        )}
      </div>
      
      <div className="flex-1">
        <div className="font-medium text-gray-900">
          {loginStreak >= 7 ? (
            <span>Epic Streak! 🔥</span>
          ) : (
            <span>Login Streak</span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {loginStreak === 1 ? (
            'First day - keep going!'
          ) : loginStreak >= 7 ? (
            `You've logged in for ${loginStreak} days in a row!`
          ) : (
            `${loginStreak} day streak - ${7 - loginStreak} more for achievement!`
          )}
        </div>
      </div>
    </div>
  );
}; 