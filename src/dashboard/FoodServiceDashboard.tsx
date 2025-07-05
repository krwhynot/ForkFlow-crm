import { Box, Stack } from '../components/ui-kit';
import { useBreakpoint } from '../hooks/useBreakpoint';

import { DashboardActivityLog } from './DashboardActivityLog';
import { DealsChart } from './DealsChart';
import { HotContacts } from './HotContacts';
import { QuickActionsFAB } from './QuickActionsFAB';
import { QuickStatsSection } from './QuickStatsSection';
import { TasksList } from './TasksList';
import { Welcome } from './Welcome';

export const FoodServiceDashboard = () => {
    const isMobile = useBreakpoint('md');

    // Always show content without loading state
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className={`max-w-7xl mx-auto ${isMobile ? 'py-2 px-2' : 'py-6 px-4'}`}>
                <Stack className="space-y-6">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Primary Content (2/3 width) */}
                        <div className="lg:col-span-2">
                            <Stack className="space-y-6">
                                {/* Revenue Chart */}
                                <DealsChart />

                                {/* Activity Log */}
                                <DashboardActivityLog />
                            </Stack>
                        </div>

                        {/* Right Column - Secondary Content (1/3 width) */}
                        <div className="lg:col-span-1">
                            <Stack className="space-y-6">
                                {/* Hot Contacts */}
                                <HotContacts />

                                {/* Tasks List */}
                                <TasksList />
                            </Stack>
                        </div>
                    </div>

                    {/* Mobile-Specific Bottom Section */}
                    {isMobile && (
                        <Box className="pb-20">
                            {/* Extra padding for FAB */}
                        </Box>
                    )}
                </Stack>

                {/* Quick Actions FAB - Fixed position for mobile */}
                <QuickActionsFAB />
            </div>
        </div>
    );
};
