import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    TrendingUp as TrendIcon,
    Schedule as TimeIcon,
    LocationOn as LocationIcon,
    Assessment as StatsIcon,
} from '@mui/icons-material';
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
                sx={{ display: 'flex', alignItems: 'center', mb: 3 }}
            >
                <TrendIcon sx={{ mr: 1 }} />
                Visit Trends & Performance
            </Typography>

            <Grid container spacing={2}>
                {/* Weekly Performance */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <StatsIcon sx={{ mr: 1, fontSize: 20 }} />
                                Weekly Performance
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="h4"
                                        component="span"
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {thisWeekVisits.length}
                                    </Typography>
                                    <Chip
                                        label={`${weekOverWeekChange > '0' ? '+' : ''}${weekOverWeekChange}%`}
                                        color={
                                            Number(weekOverWeekChange) >= 0
                                                ? 'success'
                                                : 'error'
                                        }
                                        size="small"
                                    />
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    visits this week vs {lastWeekVisits.length}{' '}
                                    last week
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Daily Visit Pattern (Last 7 Days)
                                </Typography>
                                {dailyVisitCounts.map(
                                    ({ date, count }, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 0.5,
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    minWidth: 45,
                                                    fontSize: '0.7rem',
                                                }}
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
                                                sx={{
                                                    flex: 1,
                                                    mx: 1,
                                                    height: 6,
                                                    borderRadius: 3,
                                                }}
                                            />
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    minWidth: 20,
                                                    fontSize: '0.7rem',
                                                }}
                                            >
                                                {count}
                                            </Typography>
                                        </Box>
                                    )
                                )}
                            </Box>

                            <Box
                                sx={{
                                    p: 1,
                                    bgcolor: 'primary.light',
                                    borderRadius: 1,
                                    color: 'primary.contrastText',
                                }}
                            >
                                <Typography variant="body2">
                                    <strong>Today:</strong> {todayVisits.length}{' '}
                                    visit{todayVisits.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Visit Types */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
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
                                            <ListItem key={type} sx={{ px: 0 }}>
                                                <ListItemText
                                                    primary={type
                                                        .replace('_', ' ')
                                                        .toUpperCase()}
                                                    secondary={`${count} visits (${percentage}%)`}
                                                />
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                    }}
                                                >
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={percentage}
                                                        sx={{
                                                            width: 60,
                                                            height: 4,
                                                            borderRadius: 2,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={count}
                                                        color={
                                                            getVisitTypeColor(
                                                                type
                                                            ) as any
                                                        }
                                                        size="small"
                                                    />
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                            </List>

                            {avgDuration > 0 && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        p: 1,
                                        bgcolor: 'grey.50',
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <TimeIcon
                                            sx={{ mr: 1, fontSize: 16 }}
                                        />
                                        <strong>Avg Duration:</strong>{' '}
                                        {avgDuration} minutes
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Based on {visitsWithDuration.length}{' '}
                                        visits with recorded duration
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Overview */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                Monthly Summary
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {thisMonthVisits.length}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            This Month
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{ fontWeight: 'bold' }}
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
                                            color="text.secondary"
                                        >
                                            Weekly Avg
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{ fontWeight: 'bold' }}
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
                                            color="text.secondary"
                                        >
                                            GPS Tracked
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography
                                            variant="h5"
                                            component="div"
                                            sx={{ fontWeight: 'bold' }}
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
                                            color="text.secondary"
                                        >
                                            Unique Customers
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
