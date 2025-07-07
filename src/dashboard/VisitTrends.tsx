import {
    Box,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '../components/ui-kit';
import {
    MapPinIcon as LocationIcon,
    ChartBarIcon as StatsIcon,
    ClockIcon as TimeIcon,
    ArrowTrendingUpIcon as TrendIcon,
} from '@heroicons/react/24/outline';
import { Visit } from '../types';

interface VisitTrendsProps {
    visits: Visit[];
}

export const VisitTrends = ({ visits }: VisitTrendsProps) => {
    // Calculate date ranges
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // Visit timing analysis
    const todayVisits = visits.filter(
        v => new Date(v.visit_date) >= todayStart
    );
    const thisWeekVisits = visits.filter(
        v => new Date(v.visit_date) >= weekStart
    );
    const lastWeekVisits = visits.filter(
        v =>
            new Date(v.visit_date) >= lastWeekStart &&
            new Date(v.visit_date) < weekStart
    );
    const thisMonthVisits = visits.filter(
        v => new Date(v.visit_date) >= monthStart
    );

    // Visit type breakdown
    const visitTypeStats = visits.reduce(
        (acc, visit) => {
            acc[visit.visit_type] = (acc[visit.visit_type] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Daily visit pattern (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
    }).reverse();

    const dailyVisitCounts = last7Days.map(date => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        return {
            date,
            count: visits.filter(v => {
                const visitDate = new Date(v.visit_date);
                return visitDate >= date && visitDate < nextDay;
            }).length,
        };
    });

    const maxDailyVisits = Math.max(...dailyVisitCounts.map(d => d.count), 1);

    // Visit efficiency metrics
    const visitsWithDuration = visits.filter(v => v.duration_minutes);
    const totalDuration = visitsWithDuration.reduce(
        (sum, v) => sum + (v.duration_minutes || 0),
        0
    );
    const avgDuration =
        visitsWithDuration.length > 0
            ? Math.round(totalDuration / visitsWithDuration.length)
            : 0;

    // Weekly comparison
    const weekOverWeekChange =
        lastWeekVisits.length > 0
            ? (
                ((thisWeekVisits.length - lastWeekVisits.length) /
                    lastWeekVisits.length) *
                100
            ).toFixed(0)
            : thisWeekVisits.length > 0
                ? '100'
                : '0';

    // Visit type colors
    const getVisitTypeColor = (type: string) => {
        const colorMap: Record<string, string> = {
            sales_call: 'primary',
            follow_up: 'secondary',
            delivery: 'success',
            service_call: 'warning',
            other: 'default',
        };
        return colorMap[type] || 'default';
    };

    return (
        <Box>
            <Typography
                variant="h6"
                gutterBottom
                className="flex items-center mb-6"
            >
                <TrendIcon className="h-5 w-5 mr-2" />
                Visit Trends & Performance
            </Typography>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Weekly Performance */}
                <div>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                className="flex items-center"
                            >
                                <StatsIcon className="h-5 w-5 mr-2" />
                                Weekly Performance
                            </Typography>

                            <Box className="mb-4">
                                <Box className="flex justify-between items-center mb-2">
                                    <Typography
                                        variant="h4"
                                        component="span"
                                        className="font-bold"
                                    >
                                        {thisWeekVisits.length}
                                    </Typography>
                                    <Chip
                                        label={`${weekOverWeekChange > '0' ? '+' : ''}${weekOverWeekChange}%`}
                                        className={`${Number(weekOverWeekChange) >= 0
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                        size="small"
                                    />
                                </Box>
                                <Typography
                                    variant="body2"
                                    className="text-gray-600"
                                >
                                    visits this week vs {lastWeekVisits.length}{' '}
                                    last week
                                </Typography>
                            </Box>

                            <Box className="mb-4">
                                <Typography variant="body2" className="mb-2">
                                    Daily Visit Pattern (Last 7 Days)
                                </Typography>
                                {dailyVisitCounts.map(
                                    ({ date, count }, index) => (
                                        <Box
                                            key={index}
                                            className="flex items-center mb-1"
                                        >
                                            <Typography
                                                variant="caption"
                                                className="min-w-[45px] text-xs"
                                            >
                                                {date.toLocaleDateString(
                                                    undefined,
                                                    { weekday: 'short' }
                                                )}
                                            </Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={
                                                    (count / maxDailyVisits) *
                                                    100
                                                }
                                                className="flex-1 mx-2 h-1.5 rounded-full"
                                            />
                                            <Typography
                                                variant="caption"
                                                className="min-w-[20px] text-xs"
                                            >
                                                {count}
                                            </Typography>
                                        </Box>
                                    )
                                )}
                            </Box>

                            <Box className="p-2 bg-blue-100 rounded text-blue-900">
                                <Typography variant="body2">
                                    <strong>Today:</strong> {todayVisits.length}{' '}
                                    visit{todayVisits.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </div>

                {/* Visit Types */}
                <div>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                className="flex items-center"
                            >
                                <LocationIcon className="h-5 w-5 mr-2" />
                                Visit Types
                            </Typography>

                            <List dense>
                                {Object.entries(visitTypeStats)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([type, count]) => {
                                        const percentage =
                                            visits.length > 0
                                                ? Math.round(
                                                    (count / visits.length) *
                                                    100
                                                )
                                                : 0;
                                        return (
                                            <ListItem key={type} className="px-0">
                                                <ListItemText
                                                    primary={type
                                                        .replace('_', ' ')
                                                        .toUpperCase()}
                                                    secondary={`${count} visits (${percentage}%)`}
                                                />
                                                <Box className="flex items-center gap-2">
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        className="w-15 h-1 rounded-full"
                                                    />
                                                    <Chip
                                                        label={count}
                                                        className={`${getVisitTypeColor(type) === 'primary' ? 'bg-blue-100 text-blue-800' :
                                                                getVisitTypeColor(type) === 'secondary' ? 'bg-gray-100 text-gray-800' :
                                                                    getVisitTypeColor(type) === 'success' ? 'bg-green-100 text-green-800' :
                                                                        getVisitTypeColor(type) === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                            }`}
                                                        size="small"
                                                    />
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                            </List>

                            {avgDuration > 0 && (
                                <Box className="mt-4 p-2 bg-gray-50 rounded">
                                    <Typography
                                        variant="body2"
                                        className="flex items-center"
                                    >
                                        <TimeIcon className="h-4 w-4 mr-2" />
                                        <strong>Avg Duration:</strong>{' '}
                                        {avgDuration} minutes
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-600"
                                    >
                                        Based on {visitsWithDuration.length}{' '}
                                        visits with recorded duration
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Monthly Overview */}
            <div className="mt-4">
                <Card>
                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            Monthly Summary
                        </Typography>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="text-center p-2">
                                <Typography
                                    variant="h5"
                                    component="div"
                                    className="font-bold"
                                >
                                    {thisMonthVisits.length}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
                                >
                                    This Month
                                </Typography>
                            </div>
                            <div className="text-center p-2">
                                <Typography
                                    variant="h5"
                                    component="div"
                                    className="font-bold"
                                >
                                    {Math.round(
                                        (thisMonthVisits.length /
                                            new Date(
                                                now.getFullYear(),
                                                now.getMonth() + 1,
                                                0
                                            ).getDate()) *
                                        7
                                    )}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
                                >
                                    Weekly Avg
                                </Typography>
                            </div>
                            <div className="text-center p-2">
                                <Typography
                                    variant="h5"
                                    component="div"
                                    className="font-bold"
                                >
                                    {
                                        visits.filter(
                                            v =>
                                                v.latitude &&
                                                v.longitude
                                        ).length
                                    }
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
                                >
                                    GPS Tracked
                                </Typography>
                            </div>
                            <div className="text-center p-2">
                                <Typography
                                    variant="h5"
                                    component="div"
                                    className="font-bold"
                                >
                                    {
                                        new Set(
                                            visits.map(
                                                v => v.customer_id
                                            )
                                        ).size
                                    }
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
                                >
                                    Unique Customers
                                </Typography>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Box>
    );
};
