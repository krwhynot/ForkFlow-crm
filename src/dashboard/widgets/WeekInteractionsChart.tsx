import React, { useMemo } from 'react';
import { Card, Title, BarChart } from '@tremor/react';
import { useGetIdentity } from 'react-admin';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useOptimizedDataFetch } from '../hooks/useOptimizedDataFetch';
import { debounce } from '../utils/performanceUtils';

const WeekInteractionsChartComponent: React.FC = () => {
  const { data: identity } = useGetIdentity();
  
  const { data: interactions, isLoading } = useOptimizedDataFetch({
    resource: 'interactions',
    options: {
      pagination: { page: 1, perPage: 1000 },
      filter: { 
        created_by: identity?.id,
        date: {
          $gte: startOfDay(subDays(new Date(), 6)).toISOString(),
          $lte: endOfDay(new Date()).toISOString()
        }
      },
    }
  });

  // Optimized chart data processing with memoization
  const chartData = useMemo(() => {
    if (!interactions?.length) return [];
    
    // Use a more efficient data processing approach
    const interactionsByDate = new Map<string, { calls: number; emails: number; meetings: number }>();
    
    // Single pass through interactions to group by date
    interactions.forEach(interaction => {
      const dateKey = format(new Date(interaction.date), 'yyyy-MM-dd');
      const existing = interactionsByDate.get(dateKey) || { calls: 0, emails: 0, meetings: 0 };
      
      switch (interaction.type) {
        case 'call':
          existing.calls++;
          break;
        case 'email':
          existing.emails++;
          break;
        case 'meeting':
          existing.meetings++;
          break;
      }
      
      interactionsByDate.set(dateKey, existing);
    });
    
    // Generate chart data for last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const data = interactionsByDate.get(dateKey) || { calls: 0, emails: 0, meetings: 0 };
      
      return {
        date: format(date, 'MMM d'),
        Calls: data.calls,
        Emails: data.emails,
        Meetings: data.meetings,
      };
    });
  }, [interactions]);

  if (isLoading) {
    return (
      <Card className="h-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <Title className="mb-4">Weekly Interactions Trend</Title>
      <BarChart
        data={chartData}
        index="date"
        categories={['Calls', 'Emails', 'Meetings']}
        colors={['blue', 'emerald', 'violet']}
        valueFormatter={(number: number) => number.toString()}
        yAxisWidth={40}
        className="h-60"
        showAnimation={true}
        showTooltip={true}
        showLegend={true}
      />
    </Card>
  );
};

export const WeekInteractionsChart = React.memo(WeekInteractionsChartComponent);