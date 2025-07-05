import React, { Suspense } from 'react';
import { Grid, Col } from '@tremor/react';
import { useGetIdentity } from 'react-admin';
import { WeeklyTasksWidget } from './widgets/WeeklyTasksWidget';
import { FollowUpsWidget } from './widgets/FollowUpsWidget';
import { ScheduledMeetingsWidget } from './widgets/ScheduledMeetingsWidget';
import { APriorityAccountsWidget } from './widgets/APriorityAccountsWidget';
import { NewlyAddedContactsWidget } from './widgets/NewlyAddedContactsWidget';
import { ActivityLogWidget } from './widgets/ActivityLogWidget';
import { NewlyAddedProductsWidget } from './widgets/NewlyAddedProductsWidget';
import { KanbanWidget } from './widgets/KanbanWidget';

// Lazy load chart components for better performance
const WeekInteractionsChart = React.lazy(() => import('./widgets/WeekInteractionsChart').then(module => ({ default: module.WeekInteractionsChart })));
const OpportunitiesStageChart = React.lazy(() => import('./widgets/OpportunitiesStageChart').then(module => ({ default: module.OpportunitiesStageChart })));

const ChartLoadingFallback = () => (
  <div className="h-80 bg-white rounded-lg border border-gray-200 animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
);

export const HomeDashboard: React.FC = () => {
  const { data: identity } = useGetIdentity();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header Section - Matching target design */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back, {identity?.fullName || 'User'}! Here's your summary.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        {/* Top Row - Key Metrics */}
        <Col numColSpan={1}>
          <WeeklyTasksWidget />
        </Col>
        <Col numColSpan={1}>
          <FollowUpsWidget />
        </Col>
        <Col numColSpan={1}>
          <ScheduledMeetingsWidget />
        </Col>
        <Col numColSpan={1}>
          <APriorityAccountsWidget />
        </Col>

        {/* Second Row - Analytics */}
        <Col numColSpan={2} numColSpanSm={2} numColSpanLg={2}>
          <Suspense fallback={<ChartLoadingFallback />}>
            <WeekInteractionsChart />
          </Suspense>
        </Col>
        <Col numColSpan={2} numColSpanSm={2} numColSpanLg={2}>
          <Suspense fallback={<ChartLoadingFallback />}>
            <OpportunitiesStageChart />
          </Suspense>
        </Col>

        {/* Third Row - Data Lists */}
        <Col numColSpan={1} numColSpanSm={2} numColSpanLg={1}>
          <NewlyAddedContactsWidget />
        </Col>
        <Col numColSpan={1} numColSpanSm={2} numColSpanLg={1}>
          <ActivityLogWidget />
        </Col>
        <Col numColSpan={1} numColSpanSm={2} numColSpanLg={1}>
          <NewlyAddedProductsWidget />
        </Col>
        <Col numColSpan={1} numColSpanSm={2} numColSpanLg={1}>
          <KanbanWidget />
        </Col>
      </Grid>
    </div>
  );
};