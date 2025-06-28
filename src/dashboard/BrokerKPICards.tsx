import {
    LocationOn as LocationIcon,
    Assessment as MetricsIcon,
    People as PeopleIcon,
    AttachMoney as RevenueIcon,
    Schedule as TimeIcon,
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Typography,
} from '@mui/material';
import React from 'react';
import { Customer, Order, Visit } from '../types';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    progress?: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

const KPICard = ({
    title,
    value,
    subtitle,
    icon,
    color,
    progress,
    trend,
    trendValue,
}: KPICardProps) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <Box
                    sx={{
                        bgcolor: `${color}.light`,
                        color: `${color}.contrastText`,
                        borderRadius: 1,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {icon}
                </Box>
                {trend && trendValue && (
                    <Chip
                        label={trendValue}
                        color={
                            trend === 'up'
                                ? 'success'
                                : trend === 'down'
                                  ? 'error'
                                  : 'default'
                        }
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                )}
            </Box>

            <Typography
                variant="h4"
                component="div"
                sx={{ fontWeight: 'bold', mb: 0.5 }}
            >
                {value}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {title}
            </Typography>

            {subtitle && (
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            )}

            {progress !== undefined && (
                <Box sx={{ mt: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 4, borderRadius: 2 }}
                    />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                    >
                        {progress}% of target
                    </Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

interface BrokerKPICardsProps {
    customers: Customer[];
    visits: Visit[];
    orders: Order[];
}

export const BrokerKPICards = ({
    customers,
    visits,
    orders,
}: BrokerKPICardsProps) => {
    // Calculate time periods
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Customer metrics
    const totalCustomers = customers.length;
    const newCustomersThisMonth = customers.filter(
        c => new Date(c.createdAt) >= monthStart
    ).length;
    const newCustomersLastMonth = customers.filter(
        c =>
            new Date(c.createdAt) >= lastMonthStart &&
            new Date(c.createdAt) <= lastMonthEnd
    ).length;

    // Visit metrics
    const totalVisits = visits.length;
    const visitsThisWeek = visits.filter(
        v => new Date(v.visit_date) >= weekStart
    ).length;
    const visitsThisMonth = visits.filter(
        v => new Date(v.visit_date) >= monthStart
    ).length;
    const visitsLastMonth = visits.filter(
        v =>
            new Date(v.visit_date) >= lastMonthStart &&
            new Date(v.visit_date) <= lastMonthEnd
    ).length;

    // Calculate average visit duration
    const visitsWithDuration = visits.filter(v => v.duration_minutes);
    const avgVisitDuration =
        visitsWithDuration.length > 0
            ? Math.round(
                  visitsWithDuration.reduce(
                      (sum, v) => sum + (v.duration_minutes || 0),
                      0
                  ) / visitsWithDuration.length
              )
            : 0;

    // GPS coverage - visits with location data
    const visitsWithGPS = visits.filter(v => v.latitude && v.longitude).length;
    const gpsCoverage =
        totalVisits > 0 ? Math.round((visitsWithGPS / totalVisits) * 100) : 0;

    // Customer visit frequency
    const customersWithVisits = customers.filter(
        c => c.total_visits && c.total_visits > 0
    ).length;
    const customerEngagement =
        totalCustomers > 0
            ? Math.round((customersWithVisits / totalCustomers) * 100)
            : 0;

    // Calculate trends
    const customerGrowthTrend =
        newCustomersLastMonth > 0
            ? (
                  ((newCustomersThisMonth - newCustomersLastMonth) /
                      newCustomersLastMonth) *
                  100
              ).toFixed(0) + '%'
            : newCustomersThisMonth > 0
              ? '+100%'
              : '0%';

    const visitTrend =
        visitsLastMonth > 0
            ? (
                  ((visitsThisMonth - visitsLastMonth) / visitsLastMonth) *
                  100
              ).toFixed(0) + '%'
            : visitsThisMonth > 0
              ? '+100%'
              : '0%';

    // Order metrics (if available)
    const ordersThisMonth = orders.filter(
        o => new Date(o.order_date) >= monthStart
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const avgOrderValue =
        orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0;

    const kpis = [
        {
            title: 'Total Customers',
            value: totalCustomers,
            subtitle: `${newCustomersThisMonth} added this month`,
            icon: <PeopleIcon />,
            color: 'primary',
            trend:
                newCustomersThisMonth >= newCustomersLastMonth
                    ? 'up'
                    : ('down' as const),
            trendValue: customerGrowthTrend,
        },
        {
            title: 'Visits This Week',
            value: visitsThisWeek,
            subtitle: `${visitsThisMonth} total this month`,
            icon: <LocationIcon />,
            color: 'success',
            trend:
                visitsThisMonth >= visitsLastMonth ? 'up' : ('down' as const),
            trendValue: visitTrend,
        },
        {
            title: 'Avg Visit Duration',
            value: `${avgVisitDuration}m`,
            subtitle:
                avgVisitDuration > 0 ? 'minutes per visit' : 'No duration data',
            icon: <TimeIcon />,
            color: 'info',
        },
        {
            title: 'GPS Coverage',
            value: `${gpsCoverage}%`,
            subtitle: `${visitsWithGPS} of ${totalVisits} visits`,
            icon: <LocationIcon />,
            color: 'warning',
            progress: gpsCoverage,
        },
        {
            title: 'Customer Engagement',
            value: `${customerEngagement}%`,
            subtitle: `${customersWithVisits} customers visited`,
            icon: <MetricsIcon />,
            color: 'secondary',
            progress: customerEngagement,
        },
        {
            title: 'Orders This Month',
            value: ordersThisMonth,
            subtitle:
                orders.length > 0
                    ? `$${avgOrderValue} avg value`
                    : 'No orders yet',
            icon: <RevenueIcon />,
            color: 'success',
        },
    ];

    const kpiCards = kpis.map(kpi => ({
        ...kpi,
        trend: (['up', 'down', 'stable'].includes((kpi.trend ?? '') as string)
            ? kpi.trend
            : undefined) as 'up' | 'down' | 'stable' | undefined,
    }));

    return (
        <Grid container spacing={2}>
            {kpiCards.map((kpi, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                    <KPICard {...kpi} />
                </Grid>
            ))}
        </Grid>
    );
};
