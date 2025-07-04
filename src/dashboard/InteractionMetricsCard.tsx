import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Stack,
} from '@/components/ui-kit';
import { BarChart } from '@/components/ui-kit/Chart';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Assessment as DemoIcon,
    AttachMoney as QuoteIcon,
    Reply as FollowUpIcon,
    Assignment as InteractionIcon,
} from '@mui/icons-material';
import { useGetList } from 'react-admin';
import {
    format,
    startOfWeek,
    startOfMonth,
    subDays,
    subWeeks,
    subMonths,
} from 'date-fns';
import { useBreakpoint } from '../hooks/useBreakpoint';

import { Interaction, Setting } from '../types';
import { safeTrend, validateChartData, safeAmount } from '../utils/chartSafety';

const interactionTypeIcons: Record<string, React.ReactElement> = {
    call: <PhoneIcon />,
    email: <EmailIcon />,
    'in-person': <PersonIcon />,
    demo: <DemoIcon />,
    quote: <QuoteIcon />,
    'follow-up': <FollowUpIcon />,
};

interface InteractionMetric {
    period: string;
    total: number;
    calls: number;
    emails: number;
    inPerson: number;
    demos: number;
    quotes: number;
    followUps: number;
    [key: string]: string | number; // Index signature for Nivo compatibility
}

export const InteractionMetricsCard = () => {
    const isMobile = useBreakpoint('md');

    // Get interaction types from settings
    const { data: interactionTypes } = useGetList<Setting>('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 20 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    // Get interactions from the last 3 months for trend analysis
    const threeMonthsAgo = subMonths(new Date(), 3).toISOString();
    const { data: interactions, isPending } = useGetList<Interaction>(
        'interactions',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'completedDate', order: 'DESC' },
            filter: {
                isCompleted: true,
                'completedDate@gte': threeMonthsAgo,
            },
        }
    );

    const metrics = useMemo(() => {
        const validInteractions = validateChartData(interactions);
        const validInteractionTypes = validateChartData(interactionTypes);

        if (
            validInteractions.length === 0 ||
            validInteractionTypes.length === 0
        )
            return null;

        const now = new Date();
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);
        const lastWeekStart = subWeeks(weekStart, 1);
        const lastMonthStart = subMonths(monthStart, 1);

        // Helper function to get interaction type key by ID
        const getTypeKey = (typeId: number): string => {
            const type = validInteractionTypes.find(t => t.id === typeId);
            return type?.key || 'other';
        };

        // Helper function to count interactions by type
        const countByType = (filteredInteractions: Interaction[]) => {
            const counts: Record<string, number> = {
                call: 0,
                email: 0,
                'in-person': 0,
                demo: 0,
                quote: 0,
                'follow-up': 0,
            };

            filteredInteractions.forEach(interaction => {
                const typeKey = getTypeKey(interaction.typeId);
                if (counts[typeKey] !== undefined) {
                    counts[typeKey]++;
                }
            });

            return counts;
        };

        // Today's interactions
        const todayInteractions = validInteractions.filter(
            i =>
                i.completedDate &&
                format(new Date(i.completedDate), 'yyyy-MM-dd') ===
                    format(now, 'yyyy-MM-dd')
        );

        // This week's interactions
        const thisWeekInteractions = validInteractions.filter(
            i => i.completedDate && new Date(i.completedDate) >= weekStart
        );

        // Last week's interactions
        const lastWeekInteractions = validInteractions.filter(
            i =>
                i.completedDate &&
                new Date(i.completedDate) >= lastWeekStart &&
                new Date(i.completedDate) < weekStart
        );

        // This month's interactions
        const thisMonthInteractions = validInteractions.filter(
            i => i.completedDate && new Date(i.completedDate) >= monthStart
        );

        // Last month's interactions
        const lastMonthInteractions = validInteractions.filter(
            i =>
                i.completedDate &&
                new Date(i.completedDate) >= lastMonthStart &&
                new Date(i.completedDate) < monthStart
        );

        // Calculate trends safely
        const weeklyTrend = safeTrend(
            thisWeekInteractions.length,
            lastWeekInteractions.length
        );
        const monthlyTrend = safeTrend(
            thisMonthInteractions.length,
            lastMonthInteractions.length
        );

        // Weekly breakdown for chart
        const weeklyData: InteractionMetric[] = [];
        for (let i = 6; i >= 0; i--) {
            const weekDate = subWeeks(now, i);
            const weekLabel = format(weekDate, 'MMM dd');
            const weeklyInteractions = validInteractions.filter(interaction => {
                if (!interaction.completedDate) return false;
                const interactionDate = new Date(interaction.completedDate);
                const weekStartDate = startOfWeek(weekDate);
                const weekEndDate = new Date(
                    weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000
                );
                return (
                    interactionDate >= weekStartDate &&
                    interactionDate < weekEndDate
                );
            });

            const typeCounts = countByType(weeklyInteractions);
            weeklyData.push({
                period: weekLabel,
                total: weeklyInteractions.length,
                calls: safeAmount(typeCounts.call),
                emails: safeAmount(typeCounts.email),
                inPerson: safeAmount(typeCounts['in-person']),
                demos: safeAmount(typeCounts.demo),
                quotes: safeAmount(typeCounts.quote),
                followUps: safeAmount(typeCounts['follow-up']),
            });
        }

        return {
            today: todayInteractions.length,
            thisWeek: thisWeekInteractions.length,
            thisMonth: thisMonthInteractions.length,
            weeklyTrend,
            monthlyTrend,
            weeklyData,
            thisWeekByType: countByType(thisWeekInteractions),
            thisMonthByType: countByType(thisMonthInteractions),
        };
    }, [interactions, interactionTypes]);

    if (isPending || !metrics) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Interaction Metrics
                    </Typography>
                    <Typography color="textSecondary">Loading...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Interaction Activity
                </Typography>

                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3`}>
                    {/* Today's Count */}
                    <Box className="text-center">
                        <Typography variant="h3" className="text-blue-600">
                            {safeAmount(metrics.today)}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500">
                            Today
                        </Typography>
                    </Box>

                    {/* This Week */}
                    <Box className="text-center">
                        <Stack className="flex flex-row items-center justify-center space-x-1">
                            <Typography
                                variant="h3"
                                className="text-purple-600"
                            >
                                {safeAmount(metrics.thisWeek)}
                            </Typography>
                            <Chip
                                size="small"
                                icon={
                                    metrics.weeklyTrend >= 0 ? (
                                        <TrendingUpIcon />
                                    ) : (
                                        <TrendingDownIcon />
                                    )
                                }
                                label={`${safeAmount(metrics.weeklyTrend).toFixed(0)}%`}
                                className={`${
                                    metrics.weeklyTrend >= 0
                                        ? 'text-green-600 border-green-600'
                                        : 'text-red-600 border-red-600'
                                } bg-transparent`}
                                variant="outlined"
                            />
                        </Stack>
                        <Typography variant="body2" className="text-gray-500">
                            This Week
                        </Typography>
                    </Box>

                    {/* This Month */}
                    <Box className="text-center">
                        <Stack className="flex flex-row items-center justify-center space-x-1">
                            <Typography variant="h3" className="text-blue-500">
                                {safeAmount(metrics.thisMonth)}
                            </Typography>
                            <Chip
                                size="small"
                                icon={
                                    metrics.monthlyTrend >= 0 ? (
                                        <TrendingUpIcon />
                                    ) : (
                                        <TrendingDownIcon />
                                    )
                                }
                                label={`${safeAmount(metrics.monthlyTrend).toFixed(0)}%`}
                                className={`${
                                    metrics.monthlyTrend >= 0
                                        ? 'text-green-600 border-green-600'
                                        : 'text-red-600 border-red-600'
                                } bg-transparent`}
                                variant="outlined"
                            />
                        </Stack>
                        <Typography variant="body2" className="text-gray-500">
                            This Month
                        </Typography>
                    </Box>
                </div>

                {/* Interaction Types Breakdown */}
                <Typography variant="subtitle2" className="mt-2" gutterBottom>
                    This Week by Type
                </Typography>
                <Stack className="flex flex-row space-x-1 flex-wrap mb-2">
                    {Object.entries(metrics.thisWeekByType).map(
                        ([type, count]) => (
                            <Chip
                                key={type}
                                size="small"
                                icon={
                                    interactionTypeIcons[type] || (
                                        <InteractionIcon />
                                    )
                                }
                                label={`${type}: ${count}`}
                                variant="outlined"
                                className="mb-1"
                            />
                        )
                    )}
                </Stack>

                {/* Weekly Trend Chart */}
                <Box className="mt-2">
                    {metrics.weeklyData && metrics.weeklyData.length > 0 ? (
                        <BarChart
                            data={metrics.weeklyData}
                            keys={[
                                'calls',
                                'emails',
                                'inPerson',
                                'demos',
                                'quotes',
                                'followUps',
                            ]}
                            indexBy="period"
                            height={isMobile ? 200 : 250}
                            margin={{
                                top: 20,
                                right: isMobile ? 10 : 30,
                                bottom: isMobile ? 40 : 50,
                                left: isMobile ? 10 : 30,
                            }}
                            colors={[
                                '#2196F3',
                                '#4CAF50',
                                '#FF9800',
                                '#9C27B0',
                                '#F44336',
                                '#00BCD4',
                            ]}
                            enableGridY={false}
                            enableGridX={false}
                            enableLabel={false}
                            axisBottom={{
                                tickSize: 0,
                                tickPadding: 5,
                                tickRotation: isMobile ? -45 : 0,
                                format: (value: string) =>
                                    isMobile ? value.split(' ')[1] : value,
                            }}
                            axisLeft={null}
                        />
                    ) : (
                        <Box className="flex items-center justify-center h-48 text-gray-500">
                            <Typography variant="body2">
                                No interaction data available
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
