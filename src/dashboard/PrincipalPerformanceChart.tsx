import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Stack,
    useTheme,
    useMediaQuery,
    IconButton,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Business as PrincipalIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AttachMoney as RevenueIcon,
    Assessment as MetricsIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ResponsiveBar } from '@nivo/bar';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useGetList } from 'react-admin';

import { Product, Deal, Interaction, Setting } from '../types';

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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeTab, setActiveTab] = React.useState(0);

    // Get data
    const { data: products, isPending: productsPending } = useGetList<Product>('products', {
        pagination: { page: 1, perPage: 1000 },
    });

    const { data: opportunities, isPending: opportunitiesPending } = useGetList<Deal>('opportunities', {
        pagination: { page: 1, perPage: 1000 },
    });

    const { data: interactions, isPending: interactionsPending } = useGetList<Interaction>('interactions', {
        pagination: { page: 1, perPage: 1000 },
        filter: { isCompleted: true },
    });

    const { data: principals } = useGetList<Setting>('settings', {
        filter: { category: 'principal' },
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const principalMetrics = useMemo(() => {
        if (!products || !opportunities || !interactions || !principals) return [];

        const now = new Date();
        const currentMonth = startOfMonth(now);
        const lastMonth = startOfMonth(subMonths(now, 1));

        return principals.map((principal): PrincipalMetrics => {
            // Get products for this principal
            const principalProducts = products.filter(p => p.principalId === principal.id);
            
            // Get opportunities related to these products
            const principalOpportunities = opportunities.filter(opp => 
                principalProducts.some(product => product.id === opp.productId)
            );

            // Get interactions related to these opportunities
            const principalInteractions = interactions.filter(interaction =>
                principalOpportunities.some(opp => opp.id === interaction.opportunityId)
            );

            // Calculate metrics
            const wonOpportunities = principalOpportunities.filter(opp => opp.stage === 'won');
            const totalRevenue = wonOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
            const conversionRate = principalOpportunities.length > 0 
                ? (wonOpportunities.length / principalOpportunities.length) * 100 
                : 0;
            const avgDealSize = wonOpportunities.length > 0 
                ? totalRevenue / wonOpportunities.length 
                : 0;

            // Calculate monthly trend
            const currentMonthOpps = principalOpportunities.filter(opp => 
                opp.createdAt && new Date(opp.createdAt) >= currentMonth
            );
            const lastMonthOpps = principalOpportunities.filter(opp => 
                opp.createdAt && 
                new Date(opp.createdAt) >= lastMonth && 
                new Date(opp.createdAt) < currentMonth
            );
            
            const monthlyTrend = lastMonthOpps.length > 0 
                ? ((currentMonthOpps.length - lastMonthOpps.length) / lastMonthOpps.length) * 100
                : currentMonthOpps.length > 0 ? 100 : 0;

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
        .filter(metric => metric.opportunityCount > 0 || metric.productCount > 0) // Only show principals with activity
        .sort((a, b) => b.totalRevenue - a.totalRevenue); // Sort by revenue descending
    }, [products, opportunities, interactions, principals]);

    const chartData = useMemo(() => {
        if (!principalMetrics.length) return [];

        switch (activeTab) {
            case 0: // Revenue
                return principalMetrics.map(metric => ({
                    principal: metric.principalName.length > 10 
                        ? metric.principalName.substring(0, 10) + '...' 
                        : metric.principalName,
                    revenue: metric.totalRevenue,
                    opportunities: 0, // Add for type compatibility
                    conversionRate: 0, // Add for type compatibility
                    color: metric.principalColor || theme.palette.primary.main,
                }));
            
            case 1: // Opportunities
                return principalMetrics.map(metric => ({
                    principal: metric.principalName.length > 10 
                        ? metric.principalName.substring(0, 10) + '...' 
                        : metric.principalName,
                    revenue: 0, // Add for type compatibility
                    opportunities: metric.opportunityCount,
                    conversionRate: 0, // Add for type compatibility
                    color: metric.principalColor || theme.palette.secondary.main,
                }));
            
            case 2: // Conversion Rate
                return principalMetrics.map(metric => ({
                    principal: metric.principalName.length > 10 
                        ? metric.principalName.substring(0, 10) + '...' 
                        : metric.principalName,
                    revenue: 0, // Add for type compatibility
                    opportunities: 0, // Add for type compatibility
                    conversionRate: Number(metric.conversionRate.toFixed(1)),
                    color: metric.principalColor || theme.palette.success.main,
                }));
            
            default:
                return [];
        }
    }, [principalMetrics, activeTab, theme.palette]);

    // Remove pie chart data for now - using only bar charts

    const topPrincipal = principalMetrics[0];
    const totalRevenue = principalMetrics.reduce((sum, metric) => sum + metric.totalRevenue, 0);
    const totalOpportunities = principalMetrics.reduce((sum, metric) => sum + metric.opportunityCount, 0);

    if (productsPending || opportunitiesPending || interactionsPending) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Principal Performance
                    </Typography>
                    <Typography color="textSecondary">Loading...</Typography>
                </CardContent>
            </Card>
        );
    }

    if (!principalMetrics.length) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Principal Performance
                        </Typography>
                        <IconButton size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Box>
                    <Box textAlign="center" py={3}>
                        <PrincipalIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                        <Typography variant="body2" color="textSecondary">
                            No principal data available
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Create products and opportunities to see performance
                        </Typography>
                    </Box>
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

    const tabLabels = ['Revenue', 'Opportunities', 'Conversion %'];
    const chartKeys = ['revenue', 'opportunities', 'conversionRate'];

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        Principal Performance
                    </Typography>
                    <IconButton size="small">
                        <RefreshIcon />
                    </IconButton>
                </Box>

                {/* Summary Stats */}
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    <Chip
                        size="small"
                        icon={<RevenueIcon />}
                        label={`Total: ${formatCurrency(totalRevenue)}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        size="small"
                        icon={<MetricsIcon />}
                        label={`${totalOpportunities} Opportunities`}
                        color="secondary"
                        variant="outlined"
                    />
                    {topPrincipal && (
                        <Chip
                            size="small"
                            icon={<TrendingUpIcon />}
                            label={`Top: ${topPrincipal.principalName}`}
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Stack>

                {/* Tabs for different views */}
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{ mb: 2 }}
                >
                    {tabLabels.map((label, index) => (
                        <Tab key={index} label={label} />
                    ))}
                </Tabs>

                {/* Chart */}
                <Box sx={{ height: isMobile ? 250 : 300 }}>
                    <ResponsiveBar
                        data={chartData}
                        keys={[chartKeys[activeTab]]}
                        indexBy="principal"
                        margin={{ 
                            top: 20, 
                            right: isMobile ? 10 : 30, 
                            bottom: isMobile ? 60 : 50, 
                            left: isMobile ? 50 : 80 
                        }}
                        padding={0.3}
                        colors={chartData.map(d => d.color)}
                        enableGridY={true}
                        enableGridX={false}
                        enableLabel={!isMobile}
                        labelTextColor="white"
                        axisBottom={{
                            tickSize: 0,
                            tickPadding: 5,
                            tickRotation: isMobile ? -45 : -15,
                        }}
                        axisLeft={{
                            tickSize: 0,
                            tickPadding: 5,
                            format: activeTab === 0 
                                ? (value: number) => formatCurrency(value).replace('$', '$')
                                : activeTab === 2
                                    ? (value: number) => `${value}%`
                                    : undefined,
                        }}
                        animate
                        motionConfig="gentle"
                        tooltip={({ id, value, color, indexValue }) => (
                            <div
                                style={{
                                    background: 'white',
                                    padding: '9px 12px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: color,
                                            borderRadius: '2px',
                                        }}
                                    />
                                    <strong>{indexValue}</strong>
                                </div>
                                <div>
                                    {activeTab === 0 && `Revenue: ${formatCurrency(Number(value))}`}
                                    {activeTab === 1 && `Opportunities: ${value}`}
                                    {activeTab === 2 && `Conversion: ${value}%`}
                                </div>
                            </div>
                        )}
                    />
                </Box>

                {/* Top Performers List */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Top Performers
                    </Typography>
                    <Stack spacing={1}>
                        {principalMetrics.slice(0, 3).map((metric, index) => (
                            <Box
                                key={metric.principalId}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: index === 0 ? theme.palette.success.light + '20' : 'transparent',
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography variant="body2" fontWeight="medium">
                                        #{index + 1} {metric.principalName}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        icon={metric.monthlyTrend >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                        label={`${metric.monthlyTrend.toFixed(0)}%`}
                                        color={metric.monthlyTrend >= 0 ? 'success' : 'error'}
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
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