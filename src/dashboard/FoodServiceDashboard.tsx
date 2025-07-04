import React from 'react';
import { Box, Stack } from '@/components/ui-kit';
import { useGetList } from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';

import { Contact, ContactNote, Deal } from '../types';
import { DashboardStepper } from './DashboardStepper';
import { Welcome } from './Welcome';
import { QuickStatsSection } from './QuickStatsSection';
import { InteractionMetricsCard } from './InteractionMetricsCard';
import { FollowUpRemindersWidget } from './FollowUpRemindersWidget';
import { NeedsVisitList } from './NeedsVisitList';
import { PrincipalPerformanceChart } from './PrincipalPerformanceChart';
import { DealsChart } from './DealsChart';
import { HotContacts } from './HotContacts';
import { TasksList } from './TasksList';
import { DashboardActivityLog } from './DashboardActivityLog';
import { QuickActionsFAB } from './QuickActionsFAB';

export const FoodServiceDashboard = () => {
    const isMobile = useBreakpoint('md');

    // Check if we need to show onboarding steps
    const {
        data: dataContact,
        total: totalContact,
        isPending: isPendingContact,
    } = useGetList<Contact>('contacts', {
        pagination: { page: 1, perPage: 1 },
    });

    const { total: totalContactNotes, isPending: isPendingContactNotes } =
        useGetList<ContactNote>('contactNotes', {
            pagination: { page: 1, perPage: 1 },
        });

    const { total: totalDeal, isPending: isPendingDeal } = useGetList<Deal>(
        'deals',
        {
            pagination: { page: 1, perPage: 1 },
        }
    );

    const isPending =
        isPendingContact || isPendingContactNotes || isPendingDeal;

    if (isPending) {
        return null;
    }

    // Show onboarding if no data exists
    if (!totalContact) {
        return <DashboardStepper step={1} />;
    }

    if (!totalContactNotes) {
        return <DashboardStepper step={2} contactId={dataContact?.[0]?.id} />;
    }

    // Main dashboard layout
    return (
        <div
            className={`max-w-7xl mx-auto ${isMobile ? 'py-1 px-2' : 'py-2 px-4'}`}
        >
            <Stack className={`space-y-${isMobile ? '2' : '3'}`}>
                {/* Welcome Section (Demo only) */}
                {import.meta.env.VITE_IS_DEMO === 'true' && (
                    <Box>
                        <Welcome />
                    </Box>
                )}

                {/* Quick Stats Section - Full Width */}
                <Box>
                    <QuickStatsSection />
                </Box>

                {/* Main Dashboard Grid */}
                <div
                    className={`grid grid-cols-1 lg:grid-cols-12 gap-${isMobile ? '2' : '3'}`}
                >
                    {/* Left Column - Primary Metrics */}
                    <div className="col-span-1 lg:col-span-8">
                        <Stack className={`space-y-${isMobile ? '2' : '3'}`}>
                            {/* Interaction Metrics */}
                            <InteractionMetricsCard />

                            {/* Deals Chart (if deals exist) */}
                            {totalDeal ? <DealsChart /> : null}

                            {/* Principal Performance Chart */}
                            <PrincipalPerformanceChart />

                            {/* Activity Log */}
                            <DashboardActivityLog />
                        </Stack>
                    </div>

                    {/* Right Column - Action Items & Quick Access */}
                    <div className="col-span-1 lg:col-span-4">
                        <Stack className={`space-y-${isMobile ? '2' : '3'}`}>
                            {/* Follow-up Reminders */}
                            <FollowUpRemindersWidget />

                            {/* Organizations Needing Attention */}
                            <NeedsVisitList />

                            {/* Hot Contacts */}
                            <HotContacts />

                            {/* Tasks List */}
                            <TasksList />
                        </Stack>
                    </div>
                </div>

                {/* Mobile-Specific Bottom Section */}
                {isMobile && (
                    <Box className="pb-8">
                        {' '}
                        {/* Extra padding for FAB */}
                        {/* Any mobile-specific content can go here */}
                    </Box>
                )}
            </Stack>

            {/* Quick Actions FAB - Fixed position for mobile */}
            <QuickActionsFAB />
        </div>
    );
};
