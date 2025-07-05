import {
    MapPinIcon as LocationIcon,
    ChartBarIcon as MetricsIcon,
    UsersIcon as PeopleIcon,
    CurrencyDollarIcon as RevenueIcon,
    ClockIcon as TimeIcon,
} from '@heroicons/react/24/outline';
import { BadgeDelta, Card, Flex, Grid, Metric, Text } from '@tremor/react';
import { Customer, Order, Visit } from '../types';

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
    const customerIds = new Set(visits.map(v => v.organizationId).filter(Boolean));
    const customersWithVisits = customers.filter(
        c => customerIds.has(c.id)
    ).length;
    const customerEngagement =
        totalCustomers > 0
            ? Math.round((customersWithVisits / totalCustomers) * 100)
            : 0;

    // Calculate growth percentages
    const customerGrowth =
        newCustomersLastMonth > 0
            ? ((newCustomersThisMonth - newCustomersLastMonth) /
                newCustomersLastMonth) *
            100
            : newCustomersThisMonth > 0
                ? 100
                : 0;

    const visitGrowth =
        visitsLastMonth > 0
            ? ((visitsThisMonth - visitsLastMonth) / visitsLastMonth) * 100
            : visitsThisMonth > 0
                ? 100
                : 0;

    // Order metrics
    const ordersThisMonth = orders.filter(
        o => new Date(o.order_date) >= monthStart
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const avgOrderValue =
        orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0;

    return (
        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>Total Customers</Text>
                        <Metric>{totalCustomers}</Metric>
                    </div>
                    <BadgeDelta deltaType={customerGrowth >= 0 ? "increase" : "decrease"}>
                        {customerGrowth.toFixed(1)}%
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        {newCustomersThisMonth} new this month
                    </Text>
                    <PeopleIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>

            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>Weekly Visits</Text>
                        <Metric>{visitsThisWeek}</Metric>
                    </div>
                    <BadgeDelta deltaType={visitGrowth >= 0 ? "increase" : "decrease"}>
                        {visitGrowth.toFixed(1)}%
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        {visitsThisMonth} total this month
                    </Text>
                    <LocationIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>

            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>Average Order Value</Text>
                        <Metric>${avgOrderValue}</Metric>
                    </div>
                    <BadgeDelta deltaType="unchanged">
                        {ordersThisMonth} orders
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        ${totalRevenue.toFixed(2)} total revenue
                    </Text>
                    <RevenueIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>

            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>Customer Engagement</Text>
                        <Metric>{customerEngagement}%</Metric>
                    </div>
                    <BadgeDelta deltaType={customerEngagement >= 75 ? "increase" : customerEngagement >= 50 ? "moderateIncrease" : "decrease"}>
                        Active Customers
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        {customersWithVisits} customers visited
                    </Text>
                    <MetricsIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>

            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>Average Visit Duration</Text>
                        <Metric>{avgVisitDuration} min</Metric>
                    </div>
                    <BadgeDelta deltaType={avgVisitDuration >= 30 ? "increase" : "moderateDecrease"}>
                        Time Spent
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        {visitsWithDuration.length} tracked visits
                    </Text>
                    <TimeIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>

            <Card className="max-w-lg mx-auto">
                <Flex alignItems="start">
                    <div>
                        <Text>GPS Coverage</Text>
                        <Metric>{gpsCoverage}%</Metric>
                    </div>
                    <BadgeDelta deltaType={gpsCoverage >= 90 ? "increase" : gpsCoverage >= 75 ? "moderateIncrease" : "decrease"}>
                        Location Data
                    </BadgeDelta>
                </Flex>
                <Flex className="mt-4">
                    <Text className="text-sm text-tremor-content-subtle">
                        {visitsWithGPS} visits with location
                    </Text>
                    <LocationIcon className="h-4 w-4 text-tremor-content-subtle" />
                </Flex>
            </Card>
        </Grid>
    );
};
