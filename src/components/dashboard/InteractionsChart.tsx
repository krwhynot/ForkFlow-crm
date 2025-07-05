import { ChartBarIcon } from '@heroicons/react/24/outline';
import {
    AreaChart,
    BadgeDelta,
    Card,
    Color,
    Flex,
    Grid,
    LineChart,
    Metric,
    Tab,
    TabGroup,
    TabList,
    Text,
    Title
} from '@tremor/react';
import { useState } from 'react';

interface InteractionData {
    day: string;
    date: string;
    total: number;
    calls: number;
    meetings: number;
    emails: number;
    notes: number;
}

interface Principal {
    id: string;
    name: string;
    color: Color;
}

// Mock data - replace with actual hook
const mockData: InteractionData[] = [
    {
        day: 'Mon',
        date: '2024-01-08',
        total: 12,
        calls: 4,
        meetings: 2,
        emails: 5,
        notes: 1
    },
    {
        day: 'Tue',
        date: '2024-01-09',
        total: 15,
        calls: 6,
        meetings: 3,
        emails: 4,
        notes: 2
    },
    {
        day: 'Wed',
        date: '2024-01-10',
        total: 8,
        calls: 2,
        meetings: 1,
        emails: 3,
        notes: 2
    },
    {
        day: 'Thu',
        date: '2024-01-11',
        total: 18,
        calls: 7,
        meetings: 4,
        emails: 6,
        notes: 1
    },
    {
        day: 'Fri',
        date: '2024-01-12',
        total: 14,
        calls: 5,
        meetings: 2,
        emails: 5,
        notes: 2
    },
    {
        day: 'Sat',
        date: '2024-01-13',
        total: 6,
        calls: 2,
        meetings: 0,
        emails: 3,
        notes: 1
    },
    {
        day: 'Sun',
        date: '2024-01-14',
        total: 3,
        calls: 1,
        meetings: 0,
        emails: 2,
        notes: 0
    }
];

const mockPrincipals: Principal[] = [
    { id: 'all', name: 'All Principals', color: 'blue' },
    { id: '1', name: 'Farm Fresh Foods', color: 'emerald' },
    { id: '2', name: 'Golden Grain Bakery', color: 'amber' },
    { id: '3', name: 'Mediterranean Imports', color: 'rose' },
    { id: '4', name: 'Ranch Direct', color: 'violet' }
];

const dataFormatter = (number: number) => {
    return Intl.NumberFormat('us').format(number).toString();
};

export default function InteractionsChart() {
    const [selectedPrincipal, setSelectedPrincipal] = useState<string>('all');
    const [selectedView, setSelectedView] = useState<number>(0);

    const totalInteractions = mockData.reduce((sum, day) => sum + day.total, 0);
    const avgDaily = Math.round(totalInteractions / mockData.length);

    const selectedPrincipalData = mockPrincipals.find(p => p.id === selectedPrincipal);

    // Calculate week-over-week change
    const thisWeekTotal = mockData.slice(0, 5).reduce((sum, day) => sum + day.total, 0);
    const lastWeekTotal = mockData.slice(5).reduce((sum, day) => sum + day.total, 0) * (5 / 2); // Normalize for 5 days
    const weekOverWeekChange = ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;

    const chartData = selectedView === 0 ? mockData : mockData.map(day => ({
        ...day,
        date: day.date,
        Calls: day.calls,
        Meetings: day.meetings,
        Emails: day.emails,
        Notes: day.notes
    }));

    return (
        <Card className="h-full">
            <div className="p-6">
                <Flex alignItems="start">
                    <div>
                        <Flex className="space-x-2">
                            <ChartBarIcon className="w-5 h-5 text-tremor-content-subtle" />
                            <Title>Week's Interactions</Title>
                        </Flex>
                        <Flex className="mt-2">
                            <Metric>{totalInteractions}</Metric>
                            <BadgeDelta deltaType={weekOverWeekChange >= 0 ? "increase" : "decrease"}>
                                {weekOverWeekChange.toFixed(1)}%
                            </BadgeDelta>
                        </Flex>
                    </div>
                </Flex>

                <TabGroup className="mt-4" onIndexChange={setSelectedView}>
                    <TabList>
                        <Tab>Overview</Tab>
                        <Tab>Detailed</Tab>
                    </TabList>
                </TabGroup>

                <Grid numItems={2} className="mt-4 gap-4">
                    <Card>
                        <Text>Total This Week</Text>
                        <Metric>{totalInteractions}</Metric>
                    </Card>
                    <Card>
                        <Text>Daily Average</Text>
                        <Metric>{avgDaily}</Metric>
                    </Card>
                </Grid>

                {selectedView === 0 ? (
                    <LineChart
                        className="mt-6 h-64"
                        data={chartData}
                        index="day"
                        categories={["total"]}
                        colors={[selectedPrincipalData?.color || "blue"]}
                        valueFormatter={dataFormatter}
                        showLegend={false}
                        curveType="monotone"
                        showAnimation={true}
                        showGridLines={false}
                        showYAxis={true}
                        enableTooltip={true}
                    />
                ) : (
                    <AreaChart
                        className="mt-6 h-64"
                        data={chartData}
                        index="day"
                        categories={["Calls", "Meetings", "Emails", "Notes"]}
                        colors={["emerald", "violet", "amber", "rose"]}
                        valueFormatter={dataFormatter}
                        stack={true}
                        showLegend={true}
                        showAnimation={true}
                        showGridLines={false}
                        showYAxis={true}
                        enableTooltip={true}
                    />
                )}

                {mockPrincipals.length > 1 && (
                    <div className="mt-4">
                        <Text className="mb-2">Filter by Principal:</Text>
                        <TabGroup index={mockPrincipals.findIndex(p => p.id === selectedPrincipal)} onIndexChange={(index) => setSelectedPrincipal(mockPrincipals[index].id)}>
                            <TabList>
                                {mockPrincipals.map((principal) => (
                                    <Tab key={principal.id}>{principal.name}</Tab>
                                ))}
                            </TabList>
                        </TabGroup>
                    </div>
                )}
            </div>
        </Card>
    );
} 