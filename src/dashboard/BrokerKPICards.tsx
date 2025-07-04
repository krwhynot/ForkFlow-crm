import {
    MapPinIcon as LocationIcon,
    ChartBarIcon as MetricsIcon,
    UsersIcon as PeopleIcon,
    CurrencyDollarIcon as RevenueIcon,
    ClockIcon as TimeIcon,
} from '@heroicons/react/24/outline';
import { Box } from '../components/Layout/Box';
import { Card } from '../components/Card/Card';
import { CardContent } from '../components/Card/CardContent';
import { Chip } from '../components/DataDisplay/Chip';
import { LinearProgress } from '../components/Progress/LinearProgress';
import { Typography } from '../components/Typography/Typography';
import React from 'react';

// Helper function to get theme colors
const getColorValue = (color: string, variant: string) => {
    const colorMap: Record<string, Record<string, string>> = {
        primary: {
            light: '#e3f2fd',
            contrastText: '#1976d2',
        },
        success: {
            light: '#e8f5e8',
            contrastText: '#2e7d32',
        },
        info: {
            light: '#e1f5fe',
            contrastText: '#0288d1',
        },
        warning: {
            light: '#fff3e0',
            contrastText: '#f57c00',
        },
        secondary: {
            light: '#f3e5f5',
            contrastText: '#7b1fa2',
        },
    };
    return colorMap[color]?.[variant] || '#f5f5f5';
};
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
    <Card className="h-full">
        <CardContent className="p-4">
            <Box className="flex items-start justify-between mb-2">
                <Box 
                    className="rounded p-2 flex items-center"
                    style={{
                        backgroundColor: getColorValue(color, 'light'),
                        color: getColorValue(color, 'contrastText'),
                    }}
                >
                    {icon}
                </Box>
                {trend && trendValue && (
                    <Chip
                        label={trendValue}
                        className={`h-5 text-xs ${
                            trend === 'up'
                                ? 'bg-green-500 text-white'
                                : trend === 'down'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                        size="small"
                    />
                )}
            </Box>

            <Typography
                variant="h4"
                component="div"
                className="font-bold mb-1"
            >
                {value}
            </Typography>

            <Typography variant="body2" className="text-gray-600 mb-2">
                {title}
            </Typography>

            {subtitle && (
                <Typography variant="caption" className="text-gray-600">
                    {subtitle}
                </Typography>
            )}

            {progress !== undefined && (
                <Box className="mt-2">
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        className="h-1 rounded"
                    />
                    <Typography
                        variant="caption"
                        className="text-gray-600 mt-1 block"
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
            icon: <PeopleIcon className="h-6 w-6" />,
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
            icon: <LocationIcon className="h-6 w-6" />,
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
            icon: <TimeIcon className="h-6 w-6" />,
            color: 'info',
        },
        {
            title: 'GPS Coverage',
            value: `${gpsCoverage}%`,
            subtitle: `${visitsWithGPS} of ${totalVisits} visits`,
            icon: <LocationIcon className="h-6 w-6" />,
            color: 'warning',
            progress: gpsCoverage,
        },
        {
            title: 'Customer Engagement',
            value: `${customerEngagement}%`,
            subtitle: `${customersWithVisits} customers visited`,
            icon: <MetricsIcon className="h-6 w-6" />,
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
            icon: <RevenueIcon className="h-6 w-6" />,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpiCards.map((kpi, index) => (
                <div key={index}>
                    <KPICard {...kpi} />
                </div>
            ))}
        </div>
    );
};
