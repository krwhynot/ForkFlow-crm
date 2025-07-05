import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
    BadgeDelta,
    BarChart,
    Card,
    Color,
    Flex,
    Legend,
    Metric,
    Tab,
    TabGroup,
    TabList,
    Title
} from '@tremor/react';
import { useState } from 'react';

interface OpportunityData {
    stage: string;
    total: number;
    value: number;
    farmFresh: number;
    goldenGrain: number;
    mediterranean: number;
    ranchDirect: number;
}

interface Principal {
    id: string;
    name: string;
    color: Color;
    key: keyof OpportunityData;
}

// Mock data - replace with actual hook
const mockData: OpportunityData[] = [
    {
        stage: 'Prospecting',
        total: 12,
        value: 125000,
        farmFresh: 4,
        goldenGrain: 3,
        mediterranean: 2,
        ranchDirect: 3
    },
    {
        stage: 'Qualification',
        total: 8,
        value: 180000,
        farmFresh: 3,
        goldenGrain: 2,
        mediterranean: 1,
        ranchDirect: 2
    },
    {
        stage: 'Proposal',
        total: 5,
        value: 95000,
        farmFresh: 2,
        goldenGrain: 1,
        mediterranean: 1,
        ranchDirect: 1
    },
    {
        stage: 'Negotiation',
        total: 3,
        value: 75000,
        farmFresh: 1,
        goldenGrain: 1,
        mediterranean: 0,
        ranchDirect: 1
    },
    {
        stage: 'Closed Won',
        total: 2,
        value: 45000,
        farmFresh: 1,
        goldenGrain: 0,
        mediterranean: 1,
        ranchDirect: 0
    }
];

const mockPrincipals: Principal[] = [
    { id: '1', name: 'Farm Fresh Foods', color: 'emerald', key: 'farmFresh' },
    { id: '2', name: 'Golden Grain Bakery', color: 'amber', key: 'goldenGrain' },
    { id: '3', name: 'Mediterranean Imports', color: 'rose', key: 'mediterranean' },
    { id: '4', name: 'Ranch Direct', color: 'violet', key: 'ranchDirect' }
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const dataFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
};

export default function OpportunitiesChart() {
    const [viewMode, setViewMode] = useState<'count' | 'value'>('count');
    const [showPrincipalBreakdown, setShowPrincipalBreakdown] = useState(false);

    const totalOpportunities = mockData.reduce((sum, stage) => sum + stage.total, 0);
    const totalValue = mockData.reduce((sum, stage) => sum + stage.value, 0);

    // Calculate week-over-week change
    const currentStageValues = mockData.slice(0, 3).reduce((sum, stage) => sum + stage.value, 0);
    const previousStageValues = mockData.slice(3).reduce((sum, stage) => sum + stage.value, 0);
    const valueChange = ((currentStageValues - previousStageValues) / previousStageValues) * 100;

    const chartData = showPrincipalBreakdown
        ? mockData.map(item => ({
            stage: item.stage,
            'Farm Fresh Foods': item.farmFresh,
            'Golden Grain Bakery': item.goldenGrain,
            'Mediterranean Imports': item.mediterranean,
            'Ranch Direct': item.ranchDirect,
        }))
        : mockData.map(item => ({
            stage: item.stage,
            [viewMode === 'value' ? 'Value' : 'Total']: viewMode === 'value' ? item.value : item.total,
        }));

    return (
        <Card className="h-full">
            <div className="p-6">
                <Flex alignItems="start">
                    <div>
                        <Flex className="space-x-2">
                            <ChartBarIcon className="w-5 h-5 text-tremor-content-subtle" />
                            <Title>Opportunities by Stage</Title>
                        </Flex>
                        <Flex className="mt-2">
                            <Metric>{viewMode === 'value' ? formatCurrency(totalValue) : totalOpportunities}</Metric>
                            <BadgeDelta deltaType={valueChange >= 0 ? "increase" : "decrease"}>
                                {valueChange.toFixed(1)}%
                            </BadgeDelta>
                        </Flex>
                    </div>
                </Flex>

                <TabGroup className="mt-4" onIndexChange={(index) => setViewMode(index === 0 ? 'count' : 'value')}>
                    <TabList>
                        <Tab>Count</Tab>
                        <Tab>Value</Tab>
                    </TabList>
                </TabGroup>

                <TabGroup className="mt-4" onIndexChange={(index) => setShowPrincipalBreakdown(index === 1)}>
                    <TabList>
                        <Tab>Total</Tab>
                        <Tab>By Principal</Tab>
                    </TabList>
                </TabGroup>

                <BarChart
                    className="mt-6 h-72"
                    data={chartData}
                    index="stage"
                    categories={
                        showPrincipalBreakdown
                            ? ['Farm Fresh Foods', 'Golden Grain Bakery', 'Mediterranean Imports', 'Ranch Direct']
                            : [viewMode === 'value' ? 'Value' : 'Total']
                    }
                    colors={
                        showPrincipalBreakdown
                            ? ['emerald', 'amber', 'rose', 'violet']
                            : ['violet']
                    }
                    valueFormatter={viewMode === 'value' ? formatCurrency : dataFormatter}
                    stack={showPrincipalBreakdown}
                    showLegend={showPrincipalBreakdown}
                    showAnimation={true}
                    yAxisWidth={viewMode === 'value' ? 100 : 60}
                />

                {showPrincipalBreakdown && (
                    <Legend
                        className="mt-3"
                        categories={mockPrincipals.map(p => p.name)}
                        colors={mockPrincipals.map(p => p.color)}
                    />
                )}
            </div>
        </Card>
    );
} 