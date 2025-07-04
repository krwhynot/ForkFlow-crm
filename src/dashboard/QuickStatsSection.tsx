import React, { useMemo, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    Stack,
    LinearProgress,
    IconButton,
} from '../components/ui-kit';
import {
    BuildingOfficeIcon as OrganizationIcon,
    UsersIcon as ContactIcon,
    DocumentTextIcon as InteractionIcon,
    TrendingUpIcon as OpportunityIcon,
    CurrencyDollarIcon as RevenueIcon,
    CalendarIcon as ScheduleIcon,
    PhoneIcon,
    EnvelopeIcon as EmailIcon,
    UserIcon as PersonIcon,
    ChartBarIcon as ConversionIcon,
    ArrowPathIcon as RefreshIcon,
} from '@heroicons/react/24/outline';
import { format, startOfWeek, startOfMonth, subDays, subMonths } from 'date-fns';
import { useGetList } from 'react-admin';

import { Organization, Contact, Interaction, Deal, Setting } from '../types';

// Helper function to get theme colors
const getColorValue = (color: string, variant: string) => {
    const colorMap: Record<string, Record<string, string>> = {
        primary: { light: '#e3f2fd', contrastText: '#1976d2', main: '#1976d2' },
        secondary: { light: '#f3e5f5', contrastText: '#7b1fa2', main: '#7b1fa2' },
        success: { light: '#e8f5e8', contrastText: '#2e7d32', main: '#2e7d32' },
        warning: { light: '#fff3e0', contrastText: '#f57c00', main: '#f57c00' },
        error: { light: '#ffebee', contrastText: '#d32f2f', main: '#d32f2f' },
        info: { light: '#e1f5fe', contrastText: '#0288d1', main: '#0288d1' },
    };
    return colorMap[color]?.[variant] || '#f5f5f5';
};
import { useDashboardReport } from '../hooks/useReporting';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    trend?: {
        value: number;
        isPositive: boolean;
    };
    progress?: number;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    color,
    trend,
    progress,
    onClick,
}) => {
    const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint

    return (
        <Card 
            className={`h-full transition-all duration-200 ease-in-out ${
                onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : 'cursor-default'
            }`}
            onClick={onClick}
        >
            <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                <Box className="flex justify-between items-start mb-2">
                    <Box
                        className="rounded-lg p-3 flex items-center justify-center"
                        style={{
                            backgroundColor: getColorValue(color, 'light'),
                            color: getColorValue(color, 'contrastText'),
                        }}
                    >
                        {icon}
                    </Box>
                    {trend && (
                        <Chip
                            size="small"
                            label={`${trend.isPositive ? '+' : ''}${trend.value.toFixed(1)}%`}
                            color={trend.isPositive ? 'success' : 'error'}
                            className="h-5 text-xs"
                        />
                    )}
                </Box>

                <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="div"
                    className="font-bold mb-1"
                    style={{ color: getColorValue(color, 'main') }}
                >
                    {value}
                </Typography>

                <Typography variant="body2" className="text-gray-600 mb-2">
                    {title}
                </Typography>

                {subtitle && (
                    <Typography variant="caption" className="text-gray-600 block">
                        {subtitle}
                    </Typography>
                )}

                {progress !== undefined && (
                    <Box className="mt-3">
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            className="h-1.5 rounded"
                            style={{
                                backgroundColor: getColorValue(color, 'light'),
                            }}
                        />
                        <Typography
                            variant="caption"
                            className="text-gray-600 mt-1 block"
                        >
                            {progress}% of monthly target
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export const QuickStatsSection = () => {
    const isMobile = window.innerWidth < 768; // Tailwind 'md' breakpoint

    // Use the new reporting API for dashboard data
    const { data: dashboardData, loading: dashboardLoading, fetch: fetchDashboard } = useDashboardReport();

    // Legacy data fetching for detailed calculations (can be removed once all calculations are in reporting API)
    const { data: interactions, isPending: interactionsPending } = useGetList<Interaction>('interactions', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'completedDate', order: 'DESC' },
        filter: { isCompleted: true },
    });

    const { data: opportunities, isPending: opportunitiesPending } = useGetList<Deal>('opportunities', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'createdAt', order: 'DESC' },
    });

    const { data: organizations, isPending: organizationsPending } = useGetList<Organization>('organizations', {
        pagination: { page: 1, perPage: 1000 },
    });

    const { data: contacts, isPending: contactsPending } = useGetList<Contact>('contacts', {
        pagination: { page: 1, perPage: 1000 },
    });

    const { data: interactionTypes } = useGetList<Setting>('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 20 },
    });

    // Load dashboard data on component mount
    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const stats = useMemo(() => {
        // If dashboard data is available, use it; otherwise use legacy calculations
        if (dashboardData) {
            return {
                totalInteractions: dashboardData.totalInteractions,
                totalOrganizations: dashboardData.totalOrganizations,
                totalContacts: dashboardData.totalContacts,
                totalOpportunities: dashboardData.totalOpportunities,
                pipelineValue: dashboardData.pipelineValue,
                conversionRate: dashboardData.conversionRate,
                todayInteractions: dashboardData.trends.daily,
                weeklyInteractions: dashboardData.trends.weekly,
                monthlyInteractions: dashboardData.trends.monthly,
                // Add trend calculations
                interactionTrend: {
                    value: ((dashboardData.trends.weekly - dashboardData.trends.daily) / Math.max(dashboardData.trends.daily, 1)) * 100,
                    isPositive: dashboardData.trends.weekly > dashboardData.trends.daily,
                },
            };
        }

        // Legacy calculation fallback
        if (interactionsPending || opportunitiesPending || organizationsPending || contactsPending) {
            return null;
        }

        const now = new Date();
        const today = format(now, 'yyyy-MM-dd');
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);
        const lastWeekStart = startOfWeek(subDays(now, 7));
        const lastMonthStart = subMonths(monthStart, 1);

        // Interaction stats
        const todayInteractions = interactions?.filter(i =>
            i.completedDate && format(new Date(i.completedDate), 'yyyy-MM-dd') === today
        ) || [];

        const thisWeekInteractions = interactions?.filter(i =>
            i.completedDate && new Date(i.completedDate) >= weekStart
        ) || [];

        const lastWeekInteractions = interactions?.filter(i =>
            i.completedDate &&
            new Date(i.completedDate) >= lastWeekStart &&
            new Date(i.completedDate) < weekStart
        ) || [];

        const thisMonthInteractions = interactions?.filter(i =>
            i.completedDate && new Date(i.completedDate) >= monthStart
        ) || [];

        const lastMonthInteractions = interactions?.filter(i =>
            i.completedDate &&
            new Date(i.completedDate) >= lastMonthStart &&
            new Date(i.completedDate) < monthStart
        ) || [];

        // Opportunity stats
        const activeOpportunities = opportunities?.filter(o => 
            o.stage && !['won', 'lost', 'closed'].includes(o.stage)
        ) || [];

        const thisMonthOpportunities = opportunities?.filter(o =>
            o.createdAt && new Date(o.createdAt) >= monthStart
        ) || [];

        const wonOpportunities = opportunities?.filter(o => o.stage === 'won') || [];

        // Revenue calculations
        const totalPipelineValue = activeOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
        const wonRevenue = wonOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);

        // Conversion rate calculation
        const totalOpportunities = opportunities?.length || 0;
        const conversionRate = totalOpportunities > 0 ? (wonOpportunities.length / totalOpportunities) * 100 : 0;

        // Interaction type breakdown
        const getTypeKey = (typeId: number): string => {
            const type = interactionTypes?.find(t => t.id === typeId);
            return type?.key || 'other';
        };

        const thisWeekByType = thisWeekInteractions.reduce((acc, interaction) => {
            const typeKey = getTypeKey(interaction.typeId);
            acc[typeKey] = (acc[typeKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Calculate trends
        const weeklyInteractionTrend = lastWeekInteractions.length > 0
            ? ((thisWeekInteractions.length - lastWeekInteractions.length) / lastWeekInteractions.length) * 100
            : thisWeekInteractions.length > 0 ? 100 : 0;

        const monthlyInteractionTrend = lastMonthInteractions.length > 0
            ? ((thisMonthInteractions.length - lastMonthInteractions.length) / lastMonthInteractions.length) * 100
            : thisMonthInteractions.length > 0 ? 100 : 0;

        // Organizations needing attention (no interaction in 30+ days)
        const thirtyDaysAgo = subDays(now, 30);
        const organizationsNeedingVisit = organizations?.filter(org => {
            const orgInteractions = interactions?.filter(i => i.organizationId === org.id) || [];
            const latestInteraction = orgInteractions
                .filter(i => i.completedDate)
                .sort((a, b) => new Date(b.completedDate!).getTime() - new Date(a.completedDate!).getTime())[0];
            
            return !latestInteraction || new Date(latestInteraction.completedDate!) < thirtyDaysAgo;
        }) || [];

        // Monthly targets (these would typically come from user settings)
        const monthlyInteractionTarget = 100; // Could be user-configurable
        const monthlyInteractionProgress = (thisMonthInteractions.length / monthlyInteractionTarget) * 100;

        return {
            // Today's stats
            todayInteractions: todayInteractions.length,
            
            // Weekly stats
            thisWeekInteractions: thisWeekInteractions.length,
            weeklyInteractionTrend,
            
            // Monthly stats
            thisMonthInteractions: thisMonthInteractions.length,
            monthlyInteractionTrend,
            monthlyInteractionProgress: Math.min(monthlyInteractionProgress, 100),
            
            // Pipeline stats
            activeOpportunities: activeOpportunities.length,
            totalPipelineValue,
            thisMonthOpportunities: thisMonthOpportunities.length,
            
            // Conversion stats
            conversionRate,
            wonOpportunities: wonOpportunities.length,
            wonRevenue,
            
            // Organization stats
            totalOrganizations: organizations?.length || 0,
            totalContacts: contacts?.length || 0,
            organizationsNeedingVisit: organizationsNeedingVisit.length,
            
            // Interaction breakdown
            thisWeekByType,
        };
    }, [
        dashboardData,
        interactions,
        opportunities,
        organizations,
        contacts,
        interactionTypes,
        interactionsPending,
        opportunitiesPending,
        organizationsPending,
        contactsPending
    ]);

    const handleRefresh = () => {
        fetchDashboard();
    };

    if (!stats) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Quick Stats</Typography>
                        <IconButton 
                            size="small" 
                            onClick={handleRefresh}
                            disabled={dashboardLoading}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <Typography color="textSecondary">
                        {dashboardLoading ? 'Loading dashboard data...' : 'Loading...'}
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: amount >= 1000000 ? 'compact' : 'standard',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const quickStats = [
        {
            title: 'Interactions Today',
            value: stats.todayInteractions,
            subtitle: `${stats.thisWeekInteractions} this week`,
            icon: <InteractionIcon />,
            color: 'primary' as const,
            trend: {
                value: stats.weeklyInteractionTrend ?? 0,
                isPositive: (stats.weeklyInteractionTrend ?? 0) >= 0,
            },
        },
        {
            title: 'Monthly Interactions',
            value: stats.thisMonthInteractions ?? 0,
            subtitle: `Target: 100 interactions`,
            icon: <ScheduleIcon />,
            color: 'secondary' as const,
            progress: stats.monthlyInteractionProgress ?? 0,
            trend: {
                value: stats.monthlyInteractionTrend ?? 0,
                isPositive: (stats.monthlyInteractionTrend ?? 0) >= 0,
            },
        },
        {
            title: 'Active Opportunities',
            value: stats.activeOpportunities ?? 0,
            subtitle: `${formatCurrency(stats.totalPipelineValue ?? 0)} in pipeline`,
            icon: <OpportunityIcon />,
            color: 'info' as const,
        },
        {
            title: 'Conversion Rate',
            value: `${(stats.conversionRate ?? 0).toFixed(1)}%`,
            subtitle: `${stats.wonOpportunities ?? 0} won opportunities`,
            icon: <ConversionIcon />,
            color: 'success' as const,
        },
        {
            title: 'Total Organizations',
            value: stats.totalOrganizations ?? 0,
            subtitle: `${stats.totalContacts ?? 0} contacts`,
            icon: <OrganizationIcon />,
            color: 'info' as const,
        },
        {
            title: 'Need Attention',
            value: stats.organizationsNeedingVisit ?? 0,
            subtitle: 'No contact in 30+ days',
            icon: <PhoneIcon />,
            color: ((stats.organizationsNeedingVisit ?? 0) > 0 ? 'warning' : 'success') as 'warning' | 'success',
        },
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Quick Stats
                </Typography>
                <IconButton size="small">
                    <RefreshIcon />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                {quickStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            {/* This Week's Interaction Breakdown */}
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                        This Week's Interactions by Type
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {Object.entries(stats.thisWeekByType ?? {}).map(([type, count]) => {
                            const getIcon = (type: string) => {
                                switch (type) {
                                    case 'call': return <PhoneIcon sx={{ fontSize: 14 }} />;
                                    case 'email': return <EmailIcon sx={{ fontSize: 14 }} />;
                                    case 'in-person': return <PersonIcon sx={{ fontSize: 14 }} />;
                                    default: return <InteractionIcon sx={{ fontSize: 14 }} />;
                                }
                            };

                            return (
                                <Chip
                                    key={type}
                                    size="small"
                                    icon={getIcon(type)}
                                    label={`${type}: ${count}`}
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};