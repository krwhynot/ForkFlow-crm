import { BarChart, Card, Title, Subtitle } from '@tremor/react';
import { useGetList } from 'react-admin';
import { useMemo } from 'react';
import { format, startOfMonth } from 'date-fns';

import { Deal } from '../types';
import { safeAmount, validateChartData } from '../utils/chartSafety';
import { CircularProgress } from '../components/Progress/CircularProgress';

const multiplier = {
    opportunity: 0.2,
    'proposal-sent': 0.5,
    'in-negociation': 0.8,
    delayed: 0.3,
};

const sixMonthsAgo = new Date(
    new Date().setMonth(new Date().getMonth() - 6)
).toISOString();

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
        const validData = validateChartData(data);
        if (validData.length === 0) return [];

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
                'Won Revenue': won,
                'Pending Revenue': pending,
                'Lost Revenue': lost,
            };
        });
    }, [data]);

    if (isPending) {
        return (
            <Card>
                <div className="h-96 flex items-center justify-center">
                    <CircularProgress />
                </div>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <div className="h-96 flex items-center justify-center">
                    <p>No deal data available</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <Title>Upcoming Deal Revenue</Title>
            <Subtitle>Revenue from deals over the last 6 months</Subtitle>
            <BarChart
                className="mt-6"
                data={chartData}
                index="date"
                categories={['Won Revenue', 'Pending Revenue', 'Lost Revenue']}
                colors={['green', 'orange', 'red']}
                yAxisWidth={48}
            />
        </Card>
    );
};
