import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { TodaysFollowups } from '../components/dashboard/TodaysFollowups';
import { PriorityOrganizations } from '../components/dashboard/PriorityOrganizations';
import { WeeklyActivity } from '../components/dashboard/WeeklyActivity';
import { PipelineSummary } from '../components/dashboard/PipelineSummary';
import { QuickInteractionEntry } from '../components/dashboard/QuickInteractionEntry';

export const HomeDashboard: React.FC = () => {
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
