import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { CheckCircleIcon, UserPlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const ActivityLogWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: activities, isLoading } = useGetList('interactions', {
    pagination: { page: 1, perPage: 10 },
    sort: { field: 'created_at', order: 'DESC' },
    filter: {
      created_by: identity?.id
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact_added':
        return <UserPlusIcon className="w-4 h-4 text-blue-500" />;
      case 'call':
      case 'email':
      case 'meeting':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'organization_created':
        return <BuildingOfficeIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'call':
        return `Called ${activity.contact_name || 'contact'}`;
      case 'email':
        return `Sent email to ${activity.contact_name || 'contact'}`;
      case 'meeting':
        return `Met with ${activity.contact_name || 'contact'}`;
      default:
        return activity.description || activity.type;
    }
  };

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80 overflow-hidden">
      <Title className="mb-4">Activity Log</Title>
      
      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '200px' }}>
        {activities?.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-tremor-content-strong">
                {getActivityDescription(activity)}
              </Text>
              <Text className="text-xs text-tremor-content">
                {format(new Date(activity.created_at), 'MMM d, h:mm a')}
              </Text>
            </div>
          </div>
        ))}
        
        {!activities?.length && (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <Text className="text-tremor-content">No recent activity</Text>
          </div>
        )}
      </div>
    </Card>
  );
};

export const ActivityLogWidget = React.memo(ActivityLogWidgetComponent);