import React from 'react';
import { DashboardLayout } from '../components/core/layout/DashboardLayout';
import { TodaysFollowups } from '../components/features/dashboard/TodaysFollowups';
import { PriorityOrganizations } from '../components/features/dashboard/PriorityOrganizations';
import { WeeklyActivity } from '../components/features/dashboard/WeeklyActivity';
import { PipelineSummary } from '../components/features/dashboard/PipelineSummary';
import { QuickInteractionEntry } from '../components/features/dashboard/QuickInteractionEntry';

export const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TodaysFollowups />
          <PriorityOrganizations />
          <WeeklyActivity />
          <PipelineSummary />
        </div>

        {/* Quick Interaction Entry */}
        <QuickInteractionEntry />
      </div>
    </DashboardLayout>
  );
};