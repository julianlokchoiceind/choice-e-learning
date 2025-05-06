import React from 'react';
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  FireIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  title: string;
  icon: React.ReactNode;
  date: string;
}

interface AchievementsSectionProps {
  achievements: Achievement[];
}

export default function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Achievements</h2>
      <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
        {achievements.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 flex items-center">
                <div className="mr-4 flex-shrink-0">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-gray-500">Earned on {formatDate(achievement.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No achievements yet</h3>
            <p className="mt-1 text-sm text-gray-500">Complete lessons and courses to earn achievements!</p>
          </div>
        )}
      </div>
    </div>
  );
} 