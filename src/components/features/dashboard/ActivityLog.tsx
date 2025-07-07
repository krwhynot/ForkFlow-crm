import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface ActivityItem {
  id: string;
  description: string;
  timestamp: Date;
}

interface ActivityLogProps {
  activities: ActivityItem[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Activity Log
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
            <p className="ml-3 text-sm text-gray-700">
              {activity.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};