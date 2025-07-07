import React from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface KanbanItem {
  id: string;
  company: string;
  status: 'grocery' | 'principal' | 'distributor' | 'restaurant';
  statusColor: string;
}

interface KanbanSectionProps {
  items: KanbanItem[];
}

export const KanbanSection: React.FC<KanbanSectionProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Kanban</h3>
        <button className="p-1 hover:bg-gray-100 rounded">
          <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span 
                className="text-xs font-medium px-2 py-1 rounded"
                style={{ 
                  backgroundColor: `${item.statusColor}20`,
                  color: item.statusColor 
                }}
              >
                {item.status}
              </span>
              <img 
                src="/api/placeholder/20/20" 
                alt={item.status} 
                className="h-5 w-5"
              />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900">
              {item.company}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {item.status === 'distributor' ? 'Distribution' : item.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};