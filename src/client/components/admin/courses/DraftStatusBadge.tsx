'use client';

import { FC } from 'react';

interface DraftStatusBadgeProps {
  isDraft?: boolean;
}

const DraftStatusBadge: FC<DraftStatusBadgeProps> = ({ isDraft = true }) => {
  if (!isDraft) return null;
  
  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Draft
    </div>
  );
};

export default DraftStatusBadge; 