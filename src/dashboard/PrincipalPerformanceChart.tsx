import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@/components/ui-kit';
import { BarChart } from '@/components/ui-kit/Chart';
import {
    ArrowTrendingUpIcon,
    ChartBarIcon as MetricsIcon,
    BuildingOfficeIcon as PrincipalIcon,
    ArrowPathIcon as RefreshIcon,
    CurrencyDollarIcon as RevenueIcon,
    TrendingDownIcon
} from '@heroicons/react/24/outline';
import { startOfMonth, subMonths } from 'date-fns';
import React, { useMemo } from 'react';
import { useGetList } from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';

import { Deal, Interaction, Product, Setting } from '../types';
import {
    safeAmount,
    safeCurrencyFormat,
    safeDivide,
    safeTrend,
    validateChartData,
} from '../utils/chartSafety';

interface PrincipalMetrics {
    principalId: number;
    principalName: string;
    principalColor?: string;
    totalRevenue: number;
    opportunityCount: number;
    productCount: number;
    interactionCount: number;
    conversionRate: number;
    avgDealSize: number;
    monthlyTrend: number;
}

export const PrincipalPerformanceChart = () => {
    const isMobile = useBreakpoint('md');
    const [activeTab, setActiveTab] = React.useState(0);

    // Get data
    const { data: products, isPending: productsPending } = useGetList<Product>(
        'products',
        {
            pagination: { page: 1, perPage: 1000 },
        }
    );

    const { data: opportunities, isPending: opportunitiesPending } =
        useGetList<Deal>('opportunities', {
            pagination: { page: 1, perPage: 1000 },
        });

    const { data: interactions, isPending: interactionsPending } =
        useGetList<Interaction>('interactions', {
            pagination: { page: 1, perPage: 1000 },
            filter: { isCompleted: true },
        });

    const { data: principals } = useGetList<Setting>('settings', {
        filter: { category: 'principal' },
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const principalMetrics = useMemo(() => {
        const validProducts = validateChartData(products);
        const validOpportunities = validateChartData(opportunities);
        const validInteractions = validateChartData(interactions);
        const validPrincipals = validateChartData(principals);

        if (validPrincipals.length === 0) return [];

        const now = new Date();
        const currentMonth = startOfMonth(now);
        const lastMonth = startOfMonth(subMonths(now, 1));

        return validPrincipals
            .map((principal): PrincipalMetrics => {
                // Get products for this principal
                const principalProducts = validProducts.filter(
                    p => p.principalId === principal.id
                );

                // Get opportunities related to these products
                const principalOpportunities = validOpportunities.filter(opp =>
                    principalProducts.some(
                        product => product.id === opp.productId
                    )
                );

                // Get interactions related to these opportunities
                const principalInteractions = validInteractions.filter(
                    interaction =>
                        principalOpportunities.some(
                            opp => opp.id === interaction.opportunityId
                        )
                );

                // Calculate metrics safely
                const wonOpportunities = principalOpportunities.filter(
                    opp => opp.stage === 'won'
                );
                const totalRevenue = wonOpportunities.reduce(
                    (sum, opp) => sum + safeAmount(opp.amount),
                    0
                );

                // Safe division for conversion rate
                const conversionRate =
                    safeDivide(
                        wonOpportunities.length,
                        principalOpportunities.length
                    ) * 100;

                // Safe division for average deal size
                const avgDealSize = safeDivide(
                    totalRevenue,
                    wonOpportunities.length
                );

                // Calculate monthly trend safely
                const currentMonthOpps = principalOpportunities.filter(
                    opp =>
                        opp.createdAt && new Date(opp.createdAt) >= currentMonth
                );
                const lastMonthOpps = principalOpportunities.filter(
                    opp =>
                        opp.createdAt &&
                        new Date(opp.createdAt) >= lastMonth &&
                        new Date(opp.createdAt) < currentMonth
                );

                const monthlyTrend = safeTrend(
                    currentMonthOpps.length,
                    lastMonthOpps.length
                );

                return {
                    principalId: principal.id,
                    principalName: principal.label,
                    principalColor: principal.color,
                    totalRevenue,
                    opportunityCount: principalOpportunities.length,
                    productCount: principalProducts.length,
                    interactionCount: principalInteractions.length,
                    conversionRate,
                    avgDealSize,
                    monthlyTrend,
                };
            })
            .filter(
                metric => metric.opportunityCount > 0 || metric.productCount > 0
            ) // Only show principals with activity
            .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue descending
    }, [products, opportunities, interactions, principals]);

    const chartData = useMemo(() => {
        if (!principalMetrics.length) return [];

        switch (activeTab) {
            case 0: // Revenue
                return principalMetrics.map(metric => ({
                    principal:
                        metric.principalName.length > 10
                            ? metric.principalName.substring(0, 10) + '...'
                            : metric.principalName,
                    revenue: metric.totalRevenue,
                    opportunities: 0, // Add for type compatibility
                    conversionRate: 0, // Add for type compatibility
                    color: metric.principalColor || '#2196F3',
                }));

            case 1: // Opportunities
                return principalMetrics.map(metric => ({
                    principal:
                        metric.principalName.length > 10
                            ? metric.principalName.substring(0, 10) + '...'
                            : metric.principalName,
                    revenue: 0, // Add for type compatibility
                    opportunities: metric.opportunityCount,
                    conversionRate: 0, // Add for type compatibility
                    color: metric.principalColor || '#9C27B0',
                }));

            case 2: // Conversion Rate
                return principalMetrics.map(metric => ({
                    principal:
                        metric.principalName.length > 10
                            ? metric.principalName.substring(0, 10) + '...'
                            : metric.principalName,
                    revenue: 0, // Add for type compatibility
                    opportunities: 0, // Add for type compatibility
                    conversionRate: Number(metric.conversionRate.toFixed(1)),
                    color: metric.principalColor || '#4CAF50',
                }));

            default:
                return [];
        }
    }, [principalMetrics, activeTab]);

    // Remove pie chart data for now - using only bar charts

    const topPrincipal = principalMetrics[0];
    const totalRevenue = principalMetrics.reduce(
        (sum, metric) => sum + metric.totalRevenue,
        0
    );
    const totalOpportunities = principalMetrics.reduce(
        (sum, metric) => sum + metric.opportunityCount,
        0
    );

    if (productsPending || opportunitiesPending || interactionsPending) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Principal Performance
                    </Typography>
                    <Typography className="text-gray-600">Loading...</Typography>
                </CardContent>
            </Card>
        );
    }

    if (!principalMetrics.length) {
        return (
            <Card>
                <CardContent>
                    <Box className="flex justify-between items-center mb-2">
                        <Typography variant="h6">
                            Principal Performance
                        </Typography>
                        <Button variant="ghost" size="sm" className="p-2">
                            <RefreshIcon className="h-4 w-4" />
                        </Button>
                    </Box>
                    <Box className="text-center py-3">
                        <PrincipalIcon className="h-12 w-12 text-gray-400 mb-1" />
                        <Typography variant="body2" className="text-gray-500">
                            No principal data available
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                            Create products and opportunities to see performance
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => {
        return safeCurrencyFormat(amount);
    };

    const tabLabels = ['Revenue', 'Opportunities', 'Conversion %'];
    const chartKeys = ['revenue', 'opportunities', 'conversionRate'];

    return (
        <Card>
            <CardContent>
                <Box className="flex justify-between items-center mb-2">
                    <Typography variant="h6">Principal Performance</Typography>
                    <Button variant="ghost" size="sm" className="p-2">
                        <RefreshIcon />
                    </Button>
                </Box>

                {/* Summary Stats */}
                <Stack className="flex flex-row space-x-1 flex-wrap mb-2">
                    <Chip
                        size="small"
                        icon={<RevenueIcon className="h-4 w-4" />}
                        label={`Total: ${formatCurrency(totalRevenue)}`}
                        className="text-blue-600 border-blue-600 bg-transparent border"
                    />
                    <Chip
                        size="small"
                        icon={<MetricsIcon className="h-4 w-4" />}
                        label={`${totalOpportunities} Opportunities`}
                        className="text-purple-600 border-purple-600 bg-transparent border"
                    />
                    {topPrincipal && (
                        <Chip
                            size="small"
                            icon={<ArrowTrendingUpIcon className="h-4 w-4" />}
                            label={`Top: ${topPrincipal.principalName}`}
                            className="text-green-600 border-green-600 bg-transparent border"
                        />
                    )}
                </Stack>

                {/* Tabs for different views */}
                <div className="mb-2">
                    <div
                        className={`flex ${isMobile ? 'overflow-x-auto' : 'w-full'} border-b border-gray-200`}
                    >
                        {tabLabels.map((label, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveTab(index)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === index
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    } ${!isMobile ? 'flex-1' : 'flex-shrink-0'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <Box>
                    {chartData.length > 0 ? (
                        <BarChart
                            data={chartData}
                            keys={[chartKeys[activeTab]]}
                            indexBy="principal"
                            height={isMobile ? 250 : 300}
                            margin={{
                                top: 20,
                                right: isMobile ? 10 : 30,
                                bottom: isMobile ? 60 : 50,
                                left: isMobile ? 50 : 80,
                            }}
                            colors={chartData.map(d => d.color)}
                            enableGridY={true}
                            enableGridX={false}
                            enableLabel={!isMobile}
                            axisBottom={{
                                tickSize: 0,
                                tickPadding: 5,
                                tickRotation: isMobile ? -45 : -15,
                            }}
                            axisLeft={{
                                tickSize: 0,
                                tickPadding: 5,
                                format:
                                    activeTab === 0
                                        ? (value: number) =>
                                            formatCurrency(value).replace(
                                                '$',
                                                '$'
                                            )
                                        : activeTab === 2
                                            ? (value: number) =>
                                                `${safeAmount(value)}%`
                                            : undefined,
                            }}
                        />
                    ) : (
                        <Box className="flex items-center justify-center h-48 text-gray-500">
                            <Typography variant="body2">
                                No principal performance data available
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Top Performers List */}
                <Box className="mt-2">
                    <Typography variant="subtitle2" gutterBottom>
                        Top Performers
                    </Typography>
                    <Stack className="space-y-1">
                        {principalMetrics.slice(0, 3).map((metric, index) => (
                            <Box
                                key={metric.principalId}
                                className={`flex justify-between items-center p-1 rounded ${index === 0 ? 'bg-green-50' : ''
                                    }`}
                            >
                                <Box className="flex items-center space-x-1">
                                    <Typography
                                        variant="body2"
                                        className="font-medium"
                                    >
                                        #{index + 1} {metric.principalName}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        icon={
                                            metric.monthlyTrend >= 0 ? (
                                                <ArrowTrendingUpIcon className="h-3 w-3" />
                                            ) : (
                                                <TrendingDownIcon className="h-3 w-3" />
                                            )
                                        }
                                        label={`${metric.monthlyTrend.toFixed(0)}%`}
                                        className={`${metric.monthlyTrend >= 0
                                                ? 'text-green-600 border-green-600'
                                                : 'text-red-600 border-red-600'
                                            } bg-transparent h-5 text-xs`}
                                    />
                                </Box>
                                <Typography
                                    variant="body2"
                                    className="text-gray-500"
                                >
                                    {formatCurrency(metric.totalRevenue)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};
