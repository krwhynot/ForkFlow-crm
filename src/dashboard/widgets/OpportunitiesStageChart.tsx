import React from 'react';
import { Card, Title, DonutChart } from '@tremor/react';
import { useGetList, useGetIdentity } from 'react-admin';

const OpportunitiesStageChartComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: opportunities, isLoading } = useGetList('opportunities', {
    pagination: { page: 1, perPage: 1000 },
    filter: { 
      accountManager: identity?.id
    },
  });

  // Process data by stage
  const chartData = React.useMemo(() => {
    if (!opportunities) return [];
    
    const stageGroups = opportunities.reduce((acc, opp) => {
      const stage = opp.stage || 'Unknown';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(stageGroups).map(([stage, count]) => ({
      name: stage,
      value: count,
    }));
  }, [opportunities]);

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-full mx-auto max-w-48"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <Title className="mb-4">Opportunities by Stage</Title>
      <div className="flex items-center justify-center">
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          colors={['blue', 'emerald', 'violet', 'amber', 'rose']}
          className="h-60"
          showAnimation={true}
          showTooltip={true}
          showLabel={true}
          valueFormatter={(number: number) => `${number} (${((number / totalValue) * 100).toFixed(1)}%)`}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-tremor-default text-tremor-content">
          Total Opportunities: <span className="font-semibold">{totalValue}</span>
        </p>
      </div>
    </Card>
  );
};

export const OpportunitiesStageChart = React.memo(OpportunitiesStageChartComponent);