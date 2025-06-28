import React from 'react';
import {
    Grid,
    Box,
    Stack,
    useTheme,
    useMediaQuery,
    Container,
} from '@mui/material';
import { useGetList } from 'react-admin';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

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
        <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 2 }}>
            <Stack spacing={isMobile ? 2 : 3}>
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
                <Grid container spacing={isMobile ? 2 : 3}>
                    {/* Left Column - Primary Metrics */}
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={isMobile ? 2 : 3}>
                            {/* Interaction Metrics */}
                            <InteractionMetricsCard />
                            
                            {/* Deals Chart (if deals exist) */}
                            {totalDeal ? <DealsChart /> : null}
                            
                            {/* Principal Performance Chart */}
                            <PrincipalPerformanceChart />
                            
                            {/* Activity Log */}
                            <DashboardActivityLog />
                        </Stack>
                    </Grid>

                    {/* Right Column - Action Items & Quick Access */}
                    <Grid item xs={12} lg={4}>
                        <Stack spacing={isMobile ? 2 : 3}>
                            {/* Follow-up Reminders */}
                            <FollowUpRemindersWidget />
                            
                            {/* Organizations Needing Attention */}
                            <NeedsVisitList />
                            
                            {/* Hot Contacts */}
                            <HotContacts />
                            
                            {/* Tasks List */}
                            <TasksList />
                        </Stack>
                    </Grid>
                </Grid>

                {/* Mobile-Specific Bottom Section */}
                {isMobile && (
                    <Box sx={{ pb: 8 }}> {/* Extra padding for FAB */}
                        {/* Any mobile-specific content can go here */}
                    </Box>
                )}
            </Stack>
            
            {/* Quick Actions FAB - Fixed position for mobile */}
            <QuickActionsFAB />
        </Container>
    );
};