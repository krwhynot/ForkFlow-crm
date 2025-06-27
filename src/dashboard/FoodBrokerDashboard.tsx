import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useGetIdentity, useGetList } from 'react-admin';
import { ReminderDashboard } from '../reminders/ReminderDashboard';
import { Customer, Order, Reminder, Visit } from '../types';
import { BrokerKPICards } from './BrokerKPICards';
import { DashboardActivityLog } from './DashboardActivityLog';
import { TerritoryOverview } from './TerritoryOverview';
import { VisitTrends } from './VisitTrends';

const RecentActivity = () => {
    const { identity } = useGetIdentity();

    const { data: recentVisits } = useGetList<Visit>('visits', {
        pagination: { page: 1, perPage: 3 },
        sort: { field: 'createdAt', order: 'DESC' },
        filter: { broker_id: identity?.id },
    });

    const { data: recentCustomers } = useGetList<Customer>('customers', {
        pagination: { page: 1, perPage: 3 },
        sort: { field: 'created_at', order: 'DESC' },
        filter: { broker_id: identity?.id },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Recent Activity
                </Typography>

                {recentVisits && recentVisits.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                        >
                            Recent Visits
                        </Typography>
                        {recentVisits.slice(0, 3).map(visit => (
                            <Box
                                key={visit.id}
                                sx={{
                                    mb: 1,
                                    pl: 2,
                                    borderLeft: '3px solid',
                                    borderColor: 'primary.main',
                                }}
                            >
                                <Typography variant="body2">
                                    {visit.customer_name} •{' '}
                                    {visit.visit_type.replace('_', ' ')}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {new Date(
                                        visit.visit_date
                                    ).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {recentCustomers && recentCustomers.length > 0 && (
                    <Box>
                        <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            gutterBottom
                        >
                            New Customers
                        </Typography>
                        {recentCustomers.slice(0, 3).map(customer => (
                            <Box
                                key={customer.id}
                                sx={{
                                    mb: 1,
                                    pl: 2,
                                    borderLeft: '3px solid',
                                    borderColor: 'success.main',
                                }}
                            >
                                <Typography variant="body2">
                                    {customer.business_name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {customer.business_type} •{' '}
                                    {new Date(
                                        customer.created_at
                                    ).toLocaleDateString()}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export const FoodBrokerDashboard = () => {
    const { identity } = useGetIdentity();

    const { data: customers, isLoading: customersLoading } =
        useGetList<Customer>('customers', {
            pagination: { page: 1, perPage: 1000 },
            filter: { broker_id: identity?.id },
        });

    const { data: visits, isLoading: visitsLoading } = useGetList<Visit>(
        'visits',
        {
            pagination: { page: 1, perPage: 1000 },
            filter: { broker_id: identity?.id },
        }
    );

    const { data: reminders, isLoading: remindersLoading } =
        useGetList<Reminder>('reminders', {
            pagination: { page: 1, perPage: 1000 },
            filter: { broker_id: identity?.id },
        });

    const { data: orders, isLoading: ordersLoading } = useGetList<Order>(
        'orders',
        {
            pagination: { page: 1, perPage: 1000 },
            filter: { broker_id: identity?.id },
        }
    );

    if (
        customersLoading ||
        visitsLoading ||
        remindersLoading ||
        ordersLoading
    ) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading dashboard...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom>
                Food Broker Dashboard
            </Typography>
            <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
                sx={{ mb: 3 }}
            >
                Welcome back! Here's what's happening in your territory.
            </Typography>

            {/* Advanced KPI Cards */}
            <Box sx={{ mb: 4 }}>
                <BrokerKPICards
                    customers={customers || []}
                    visits={visits || []}
                    orders={orders || []}
                />
            </Box>

            {/* Main Dashboard Content */}
            <Grid container spacing={3}>
                <Grid item xs={12} xl={8}>
                    <Stack spacing={3}>
                        <ReminderDashboard />
                        <VisitTrends visits={visits || []} />
                    </Stack>
                </Grid>
                <Grid item xs={12} xl={4}>
                    <Stack spacing={3}>
                        <TerritoryOverview
                            customers={customers || []}
                            visits={visits || []}
                        />
                        <RecentActivity />
                        <DashboardActivityLog />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
