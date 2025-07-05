import React from 'react';
import { Card, Text, Metric, BadgeDelta, Flex } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { ClockIcon } from '@heroicons/react/24/outline';

const FollowUpsWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: followUps, isLoading } = useGetList('interactions', {
    pagination: { page: 1, perPage: 100 },
    filter: { 
      type: 'follow_up',
      status: 'pending',
      created_by: identity?.id
    },
  });

  const pendingFollowUps = followUps?.length || 0;
  const overdueTasks = followUps?.filter(
    task => new Date(task.due_date) < new Date()
  ).length || 0;

  if (isLoading) {
    return (
      <Card className="h-44">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-32 hover:shadow-md transition-shadow bg-white border border-gray-200">
      <Flex alignItems="start" justifyContent="between" className="mb-4">
        <div className="truncate">
          <Text className="text-sm text-gray-600 font-medium">
            Follow-ups
          </Text>
          <Metric className="text-2xl font-bold text-gray-900 mt-1">
            {pendingFollowUps}
          </Metric>
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <ClockIcon className="h-5 w-5 text-yellow-600" />
          </div>
        </div>
      </Flex>
      
      <div className="text-xs text-gray-500">
        {overdueTasks > 0 ? (
          <span className="text-red-600 font-medium">{overdueTasks} overdue</span>
        ) : pendingFollowUps > 0 ? (
          <span className="text-green-600 font-medium">All current</span>
        ) : (
          <span>No pending follow-ups</span>
        )}
      </div>
    </Card>
  );
};

export const FollowUpsWidget = React.memo(FollowUpsWidgetComponent);