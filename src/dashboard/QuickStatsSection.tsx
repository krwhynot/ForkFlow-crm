import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Chip,
    Stack,
    LinearProgress,
    useTheme,
    useMediaQuery,
    IconButton,
} from '@mui/material';
import {
    Business as OrganizationIcon,
    People as ContactIcon,
    Assignment as InteractionIcon,
    TrendingUp as OpportunityIcon,
    AttachMoney as RevenueIcon,
    Schedule as ScheduleIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    Assessment as ConversionIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, startOfWeek, startOfMonth, subDays, subMonths } from 'date-fns';
import { useGetList } from 'react-admin';

import { Organization, Contact, Interaction, Deal, Setting } from '../types';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Card 
            sx={{ 
                height: '100%', 
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': onClick ? { 
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                } : {},
            }}
            onClick={onClick}
        >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Box
                        sx={{
                            bgcolor: `${color}.light`,
                            color: `${color}.contrastText`,
                            borderRadius: 2,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                    {trend && (
                        <Chip
                            size="small"
                            label={`${trend.isPositive ? '+' : ''}${trend.value.toFixed(1)}%`}
                            color={trend.isPositive ? 'success' : 'error'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>

                <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="div"
                    sx={{ fontWeight: 'bold', mb: 0.5 }}
                    color={`${color}.main`}
                >
                    {value}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {title}
                </Typography>

                {subtitle && (
                    <Typography variant="caption" color="text.secondary" display="block">
                        {subtitle}
                    </Typography>
                )}

                {progress !== undefined && (
                    <Box sx={{ mt: 1.5 }}>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: `${color}.light`,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: `${color}.main`,
                                },
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 0.5, display: 'block' }}
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Get data for calculations
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

    const stats = useMemo(() => {
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

    if (!stats) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">Quick Stats</Typography>
                        <IconButton size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <Typography color="textSecondary">Loading...</Typography>
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
                value: stats.weeklyInteractionTrend,
                isPositive: stats.weeklyInteractionTrend >= 0,
            },
        },
        {
            title: 'Monthly Interactions',
            value: stats.thisMonthInteractions,
            subtitle: `Target: 100 interactions`,
            icon: <ScheduleIcon />,
            color: 'secondary' as const,
            progress: stats.monthlyInteractionProgress,
            trend: {
                value: stats.monthlyInteractionTrend,
                isPositive: stats.monthlyInteractionTrend >= 0,
            },
        },
        {
            title: 'Active Opportunities',
            value: stats.activeOpportunities,
            subtitle: `${formatCurrency(stats.totalPipelineValue)} in pipeline`,
            icon: <OpportunityIcon />,
            color: 'info' as const,
        },
        {
            title: 'Conversion Rate',
            value: `${stats.conversionRate.toFixed(1)}%`,
            subtitle: `${stats.wonOpportunities} won opportunities`,
            icon: <ConversionIcon />,
            color: 'success' as const,
        },
        {
            title: 'Total Organizations',
            value: stats.totalOrganizations,
            subtitle: `${stats.totalContacts} contacts`,
            icon: <OrganizationIcon />,
            color: 'info' as const,
        },
        {
            title: 'Need Attention',
            value: stats.organizationsNeedingVisit,
            subtitle: 'No contact in 30+ days',
            icon: <PhoneIcon />,
            color: (stats.organizationsNeedingVisit > 0 ? 'warning' : 'success') as 'warning' | 'success',
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
                        {Object.entries(stats.thisWeekByType).map(([type, count]) => {
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