import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
} from '@mui/material';
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
import { ResponsiveBar } from '@nivo/bar';
import { useGetList } from 'react-admin';
import { format, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

import { Interaction, Setting } from '../types';

const interactionTypeIcons: Record<string, React.ReactNode> = {
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Get interaction types from settings
    const { data: interactionTypes } = useGetList<Setting>('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 20 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    // Get interactions from the last 3 months for trend analysis
    const threeMonthsAgo = subMonths(new Date(), 3).toISOString();
    const { data: interactions, isPending } = useGetList<Interaction>('interactions', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'completedDate', order: 'DESC' },
        filter: {
            isCompleted: true,
            'completedDate@gte': threeMonthsAgo,
        },
    });

    const metrics = useMemo(() => {
        if (!interactions || !interactionTypes) return null;

        const now = new Date();
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);
        const lastWeekStart = subWeeks(weekStart, 1);
        const lastMonthStart = subMonths(monthStart, 1);

        // Helper function to get interaction type key by ID
        const getTypeKey = (typeId: number): string => {
            const type = interactionTypes.find(t => t.id === typeId);
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
        const todayInteractions = interactions.filter(i => 
            i.completedDate && format(new Date(i.completedDate), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
        );

        // This week's interactions
        const thisWeekInteractions = interactions.filter(i => 
            i.completedDate && new Date(i.completedDate) >= weekStart
        );

        // Last week's interactions
        const lastWeekInteractions = interactions.filter(i => 
            i.completedDate && 
            new Date(i.completedDate) >= lastWeekStart && 
            new Date(i.completedDate) < weekStart
        );

        // This month's interactions
        const thisMonthInteractions = interactions.filter(i => 
            i.completedDate && new Date(i.completedDate) >= monthStart
        );

        // Last month's interactions
        const lastMonthInteractions = interactions.filter(i => 
            i.completedDate && 
            new Date(i.completedDate) >= lastMonthStart && 
            new Date(i.completedDate) < monthStart
        );

        // Calculate trends
        const weeklyTrend = lastWeekInteractions.length > 0 
            ? ((thisWeekInteractions.length - lastWeekInteractions.length) / lastWeekInteractions.length) * 100
            : thisWeekInteractions.length > 0 ? 100 : 0;

        const monthlyTrend = lastMonthInteractions.length > 0
            ? ((thisMonthInteractions.length - lastMonthInteractions.length) / lastMonthInteractions.length) * 100
            : thisMonthInteractions.length > 0 ? 100 : 0;

        // Weekly breakdown for chart
        const weeklyData: InteractionMetric[] = [];
        for (let i = 6; i >= 0; i--) {
            const weekDate = subWeeks(now, i);
            const weekLabel = format(weekDate, 'MMM dd');
            const weeklyInteractions = interactions.filter(interaction => {
                if (!interaction.completedDate) return false;
                const interactionDate = new Date(interaction.completedDate);
                const weekStartDate = startOfWeek(weekDate);
                const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                return interactionDate >= weekStartDate && interactionDate < weekEndDate;
            });

            const typeCounts = countByType(weeklyInteractions);
            weeklyData.push({
                period: weekLabel,
                total: weeklyInteractions.length,
                calls: typeCounts.call,
                emails: typeCounts.email,
                inPerson: typeCounts['in-person'],
                demos: typeCounts.demo,
                quotes: typeCounts.quote,
                followUps: typeCounts['follow-up'],
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
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {/* Today's Count */}
                    <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                            <Typography variant="h3" color="primary.main">
                                {metrics.today}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Today
                            </Typography>
                        </Box>
                    </Grid>

                    {/* This Week */}
                    <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <Typography variant="h3" color="secondary.main">
                                    {metrics.thisWeek}
                                </Typography>
                                <Chip
                                    size="small"
                                    icon={metrics.weeklyTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`${metrics.weeklyTrend.toFixed(0)}%`}
                                    color={metrics.weeklyTrend >= 0 ? 'success' : 'error'}
                                    variant="outlined"
                                />
                            </Stack>
                            <Typography variant="body2" color="textSecondary">
                                This Week
                            </Typography>
                        </Box>
                    </Grid>

                    {/* This Month */}
                    <Grid item xs={12} sm={4}>
                        <Box textAlign="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <Typography variant="h3" color="info.main">
                                    {metrics.thisMonth}
                                </Typography>
                                <Chip
                                    size="small"
                                    icon={metrics.monthlyTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label={`${metrics.monthlyTrend.toFixed(0)}%`}
                                    color={metrics.monthlyTrend >= 0 ? 'success' : 'error'}
                                    variant="outlined"
                                />
                            </Stack>
                            <Typography variant="body2" color="textSecondary">
                                This Month
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Interaction Types Breakdown */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    This Week by Type
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    {Object.entries(metrics.thisWeekByType).map(([type, count]) => (
                        <Chip
                            key={type}
                            size="small"
                            icon={interactionTypeIcons[type] || <InteractionIcon />}
                            label={`${type}: ${count}`}
                            variant="outlined"
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>

                {/* Weekly Trend Chart */}
                <Box sx={{ height: isMobile ? 200 : 250, mt: 2 }}>
                    <ResponsiveBar
                        data={metrics.weeklyData}
                        keys={['calls', 'emails', 'inPerson', 'demos', 'quotes', 'followUps']}
                        indexBy="period"
                        margin={{ 
                            top: 20, 
                            right: isMobile ? 10 : 30, 
                            bottom: isMobile ? 40 : 50, 
                            left: isMobile ? 10 : 30 
                        }}
                        padding={0.3}
                        colors={['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']}
                        enableGridY={false}
                        enableGridX={false}
                        enableLabel={false}
                        axisBottom={{
                            tickSize: 0,
                            tickPadding: 5,
                            tickRotation: isMobile ? -45 : 0,
                            format: (value: string) => isMobile ? value.split(' ')[1] : value,
                        }}
                        axisLeft={null}
                        axisRight={null}
                        animate
                        motionConfig="gentle"
                        tooltip={({ id, value, color, indexValue }) => (
                            <div
                                style={{
                                    background: 'white',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                <strong>{indexValue}</strong><br />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: color,
                                            borderRadius: '2px',
                                        }}
                                    />
                                    {id}: {value}
                                </div>
                            </div>
                        )}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};