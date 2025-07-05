import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from '../components/ui-kit';
import { useGetIdentity, useGetList } from 'react-admin';
import { ReminderDashboard } from '../reminders/ReminderDashboard';
import { Customer, Order, Reminder, Visit } from '../types';
import { BrokerKPICards } from './BrokerKPICards';
import { DashboardActivityLog } from './DashboardActivityLog';
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
                <Typography variant="h6" className="mb-2">
                    Recent Activity
                </Typography>

                {recentVisits && recentVisits.length > 0 && (
                    <Box className="mb-4">
                        <Typography
                            variant="subtitle2"
                            className="text-gray-600 mb-2"
                        >
                            Recent Visits
                        </Typography>
                        {recentVisits.slice(0, 3).map(visit => (
                            <Box
                                key={visit.id}
                                className="mb-2 pl-4 border-l-4 border-blue-600"
                            >
                                <Typography variant="body2">
                                    {visit.customer_name} •{' '}
                                    {visit.visit_type.replace('_', ' ')}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
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
                            className="text-gray-600 mb-2"
                        >
                            New Customers
                        </Typography>
                        {recentCustomers.slice(0, 3).map(customer => (
                            <Box
                                key={customer.id}
                                className="mb-2 pl-4 border-l-4 border-green-600"
                            >
                                <Typography variant="body2">
                                    {customer.business_name}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    className="text-gray-600"
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
            <Box className="p-6">
                <Typography>Loading dashboard...</Typography>
            </Box>
        );
    }

    return (
        <Box className="p-2 sm:p-4 md:p-6">
            <Typography variant="h4" className="mb-2">
                Food Broker Dashboard
            </Typography>
            <Typography variant="subtitle1" className="text-gray-600 mb-6">
                                        Welcome back! Here's what's happening with your customers.
            </Typography>

            {/* Advanced KPI Cards */}
            <Box className="mb-8">
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
                        <RecentActivity />
                        <DashboardActivityLog />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
