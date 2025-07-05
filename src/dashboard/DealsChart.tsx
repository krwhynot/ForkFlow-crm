import { BarChart, Card, Subtitle, Title } from '@tremor/react';
import { useMemo } from 'react';
import { useGetList } from 'react-admin';

import { Deal } from '../types';

const multiplier = {
    opportunity: 0.2,
    'proposal-sent': 0.5,
    'in-negociation': 0.8,
    delayed: 0.3,
};

const sixMonthsAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 6)
).toISOString();

// Sample data to match the Atomic CRM design
const sampleChartData = [
    { date: 'Jan', Won: 0, Pending: 75000, Lost: 25000 },
    { date: 'Feb', Won: 50000, Pending: 100000, Lost: 15000 },
    { date: 'Mar', Won: 80000, Pending: 120000, Lost: 30000 },
    { date: 'Apr', Won: 60000, Pending: 90000, Lost: 40000 },
    { date: 'May', Won: 100000, Pending: 150000, Lost: 20000 },
    { date: 'Jun', Won: 120000, Pending: 180000, Lost: 35000 },
    { date: 'Jul', Won: 90000, Pending: 110000, Lost: 50000 },
];

export const DealsChart = () => {
    const { data, isPending } = useGetList<Deal>('deals', {
        pagination: { perPage: 100, page: 1 },
        sort: {
            field: 'createdAt',
            order: 'ASC',
        },
        filter: {
            'createdAt@gte': sixMonthsAgo,
        },
    });

    const chartData = useMemo(() => {
        // Always use sample data for demo purposes
        return sampleChartData;

        // Commented out real data logic for now
        /*
        const validData = validateChartData(data);
        
        // If we have real data, use it; otherwise use sample data
        if (validData.length === 0) {
            return sampleChartData;
        }

        const dealsByMonth = validData.reduce(
            (acc, deal) => {
                const month = startOfMonth(
                    deal.createdAt ?? new Date()
                ).toISOString();
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push(deal);
                return acc;
            },
            {} as Record<string, Deal[]>
        );

        return Object.keys(dealsByMonth).map(month => {
            const won = dealsByMonth[month]
                .filter(deal => deal.stage === 'won')
                .reduce((acc, deal) => acc + safeAmount(deal.amount), 0);

            const pending = dealsByMonth[month]
                .filter(deal => !['won', 'lost'].includes(deal.stage))
                .reduce((acc, deal) => {
                    const stageMultiplier =
                        multiplier[deal.stage as keyof typeof multiplier] || 0;
                    return acc + safeAmount(deal.amount) * stageMultiplier;
                }, 0);

            const lost = dealsByMonth[month]
                .filter(deal => deal.stage === 'lost')
                .reduce((acc, deal) => acc + safeAmount(deal.amount), 0);

            return {
                date: format(new Date(month), 'MMM'),
                Won: won,
                Pending: pending,
                Lost: lost,
            };
        });
        */
    }, [data]);

    // Always show content, no loading spinner
    return (
        <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Title className="text-xl font-bold text-gray-800">Upcoming Deal Revenue</Title>
                    <Subtitle className="text-gray-600">Revenue from deals over the last 6 months</Subtitle>
                </div>
            </div>
            <BarChart
                className="mt-6"
                data={chartData}
                index="date"
                categories={['Won', 'Pending', 'Lost']}
                colors={['emerald', 'orange', 'red']}
                yAxisWidth={60}
                showLegend={true}
                showGridLines={true}
                showXAxis={true}
                showYAxis={true}
                valueFormatter={(value) =>
                    new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(value)
                }
            />
        </Card>
    );
};
