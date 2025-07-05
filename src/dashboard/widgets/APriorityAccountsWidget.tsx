import { StarIcon } from '@heroicons/react/24/outline';
import { Card, Flex, Metric, Text } from '@tremor/react';
import React from 'react';
import { useGetIdentity, useGetList } from 'react-admin';

const APriorityAccountsWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();

  const { data: organizations, isLoading } = useGetList('organizations', {
    pagination: { page: 1, perPage: 100 },
    filter: {
      salesId: identity?.id,
      priority: 'A'
    },
  });

  const highPriorityAccounts = organizations?.length || 0;
      const needsAttention = organizations?.filter(
      organization => {
        const lastContact = organization.last_interaction_date;
      if (!lastContact) return true;

      const daysSinceContact = Math.floor(
        (new Date().getTime() - new Date(lastContact).getTime()) / (1000 * 3600 * 24)
      );
      return daysSinceContact > 14; // More than 2 weeks
    }
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
            A-Priority Accounts
          </Text>
          <Metric className="text-2xl font-bold text-gray-900 mt-1">
            {highPriorityAccounts}
          </Metric>
        </div>
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <StarIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </Flex>

      <div className="text-xs text-gray-500">
        {needsAttention > 0 ? (
          <span className="text-orange-600 font-medium">
            {needsAttention} need{needsAttention === 1 ? 's' : ''} attention
          </span>
        ) : (
          <span className="text-green-600 font-medium">All up to date</span>
        )}
      </div>
    </Card>
  );
};

export const APriorityAccountsWidget = React.memo(APriorityAccountsWidgetComponent);