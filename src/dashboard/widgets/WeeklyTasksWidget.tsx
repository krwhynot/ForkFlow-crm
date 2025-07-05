import React from 'react';
import { Card, Text, Metric, ProgressBar, Flex } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const WeeklyTasksWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: tasks, isLoading } = useGetList('tasks', {
    pagination: { page: 1, perPage: 100 },
    filter: { 
      assigned_to: identity?.id,
      due_date: { 
        $gte: new Date().toISOString().split('T')[0] 
      } 
    },
  });

  const completedTasks = tasks?.filter(task => task.completed).length || 0;
  const totalTasks = tasks?.length || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
            Weekly Tasks
          </Text>
          <Metric className="text-2xl font-bold text-gray-900 mt-1">
            {totalTasks}
          </Metric>
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </Flex>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{completedTasks} completed</span>
          <span>{completionRate.toFixed(0)}%</span>
        </div>
        <ProgressBar 
          value={completionRate} 
          className="h-2"
          color="blue"
        />
      </div>
    </Card>
  );
};

export const WeeklyTasksWidget = React.memo(WeeklyTasksWidgetComponent);