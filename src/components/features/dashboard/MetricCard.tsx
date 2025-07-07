import React from 'react';
import { 
  CheckIcon, 
  UserPlusIcon, 
  CalendarIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  value: number;
  label: string;
  type: 'tasks' | 'followups' | 'meetings' | 'accounts';
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, label, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'tasks':
        return <CheckIcon className="h-6 w-6 text-metric-green" />;
      case 'followups':
        return <UserPlusIcon className="h-6 w-6 text-metric-orange" />;
      case 'meetings':
        return <CalendarIcon className="h-6 w-6 text-metric-blue" />;
      case 'accounts':
        return <ChartBarIcon className="h-6 w-6 text-metric-purple" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
        <div className="ml-4">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
};