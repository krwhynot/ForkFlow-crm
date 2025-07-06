import React from 'react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

const KanbanWidgetComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: opportunities, isLoading } = useGetList('deals', {
    pagination: { page: 1, perPage: 20 },
    sort: { field: 'updated_at', order: 'DESC' },
    filter: {
      salesId: identity?.id
    }
  });

  const stageColumns = React.useMemo(() => {
    if (!opportunities) return [];
    
    const stages = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Closed-Won'];
    
    return stages.map(stage => {
      const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
      return {
        name: stage,
        count: stageOpportunities.length,
        opportunities: stageOpportunities.slice(0, 3), // Show only first 3
        color: getStageColor(stage)
      };
    });
  }, [opportunities]);

  function getStageColor(stage: string) {
    switch (stage) {
      case 'Prospect':
        return 'gray';
      case 'Qualified':
        return 'blue';
      case 'Proposal':
        return 'yellow';
      case 'Negotiation':
        return 'orange';
      case 'Closed-Won':
        return 'green';
      default:
        return 'gray';
    }
  }

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <Title>Pipeline Overview</Title>
        <Squares2X2Icon className="w-5 h-5 text-tremor-brand" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto" style={{ maxHeight: '200px' }}>
        {stageColumns.map((column) => (
          <div key={column.name} className="bg-gray-50 rounded p-2">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs font-medium text-tremor-content-strong truncate">
                {column.name}
              </Text>
              <Badge size="xs" color={column.color as any}>
                {column.count}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {column.opportunities.map((opp) => (
                <div key={opp.id} className="bg-white p-2 rounded border text-xs">
                  <Text className="font-medium text-tremor-content-strong line-clamp-1">
                    {opp.name}
                  </Text>
                  {opp.value && (
                    <Text className="text-tremor-content">
                      ${(opp.value / 1000).toFixed(0)}k
                    </Text>
                  )}
                </div>
              ))}
              
              {column.count > 3 && (
                <div className="text-center py-1">
                  <Text className="text-xs text-tremor-content">
                    +{column.count - 3} more
                  </Text>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {!opportunities?.length && (
        <div className="text-center py-8">
          <Squares2X2Icon className="w-6 h-6 text-gray-300 mx-auto mb-2" />
          <Text className="text-tremor-content">No opportunities</Text>
        </div>
      )}
    </Card>
  );
};

export const KanbanWidget = React.memo(KanbanWidgetComponent);