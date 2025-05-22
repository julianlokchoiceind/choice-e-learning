import { useEffect, useState } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import { LoadingState } from '@/client/components/common';

interface UserLoginStreakProps {
  loginStreak?: number;
  isLoading?: boolean;
}

export const UserLoginStreak = ({ loginStreak = 0, isLoading = false }: UserLoginStreakProps) => {
  const hasLoginStreak = loginStreak > 0;
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <LoadingState variant="section" />
      </div>
    );
  }
  
  if (!hasLoginStreak) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Daily Login Streak</h3>
        <p className="text-sm text-gray-500">
          Sign in every day to build your streak and earn achievement points!
        </p>
      </div>
    );
  }

  // Generate flame icons based on streak count
  const flameCount = Math.min(7, loginStreak);
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Daily Login Streak</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex">
          {[...Array(flameCount)].map((_, index) => (
            <FireIcon key={index} className={`h-6 w-6 ${index % 2 === 0 ? 'text-red-500' : 'text-orange-500'}`} />
          ))}
        </div>
        <span className="text-xl font-bold">{loginStreak} days</span>
      </div>
      <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-red-500" 
          style={{ width: `${Math.min(100, (loginStreak / 30) * 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {loginStreak < 30 ? `${30 - loginStreak} more days until next achievement!` : 'Achievement unlocked!'}
      </p>
    </div>
  );
};

export default UserLoginStreak; 