import { CheckCircleIcon, TargetIcon, TrophyIcon } from '@heroicons/react/24/outline';
import {
    BadgeDelta,
    Card,
    Color,
    DeltaType,
    Flex,
    Grid,
    ProgressBar,
    Text,
    Title
} from '@tremor/react';

interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    category: 'visits' | 'interactions' | 'opportunities' | 'revenue';
    dueDate: string;
    isCompleted: boolean;
}

// Mock data - replace with actual hook
const mockGoals: Goal[] = [
    {
        id: '1',
        title: 'Weekly Customer Visits',
        target: 15,
        current: 12,
        unit: 'visits',
        category: 'visits',
        dueDate: '2024-01-19',
        isCompleted: false
    },
    {
        id: '2',
        title: 'New Opportunities Created',
        target: 5,
        current: 3,
        unit: 'opportunities',
        category: 'opportunities',
        dueDate: '2024-01-19',
        isCompleted: false
    },
    {
        id: '3',
        title: 'Follow-up Interactions',
        target: 20,
        current: 22,
        unit: 'interactions',
        category: 'interactions',
        dueDate: '2024-01-19',
        isCompleted: true
    },
    {
        id: '4',
        title: 'Revenue Target',
        target: 50000,
        current: 35000,
        unit: 'USD',
        category: 'revenue',
        dueDate: '2024-01-19',
        isCompleted: false
    }
];

const getCategoryColor = (category: Goal['category']): Color => {
    switch (category) {
        case 'visits':
            return 'blue';
        case 'interactions':
            return 'emerald';
        case 'opportunities':
            return 'violet';
        case 'revenue':
            return 'amber';
        default:
            return 'gray';
    }
};

const getProgressDeltaType = (percentage: number): DeltaType => {
    if (percentage >= 100) return 'increase';
    if (percentage >= 75) return 'moderateIncrease';
    if (percentage >= 50) return 'unchanged';
    return 'decrease';
};

const formatValue = (value: number, unit: string) => {
    if (unit === 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
    return `${value} ${unit}`;
};

const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
};

export default function WeeklyGoals() {
    const completedGoals = mockGoals.filter(goal => goal.isCompleted).length;
    const totalGoals = mockGoals.length;
    const overallProgress = Math.round((completedGoals / totalGoals) * 100);

    return (
        <Card>
            <Flex className="space-x-2" alignItems="center">
                <TrophyIcon className="w-6 h-6 text-amber-500" />
                <Title>Weekly Goals</Title>
                <BadgeDelta
                    deltaType={getProgressDeltaType(overallProgress)}
                    size="xs"
                >
                    {completedGoals}/{totalGoals} Completed
                </BadgeDelta>
            </Flex>

            <Grid numItems={1} className="gap-4 mt-4">
                {mockGoals.map((goal) => {
                    const percentage = calculatePercentage(goal.current, goal.target);
                    const deltaType = getProgressDeltaType(percentage);

                    return (
                        <Card
                            key={goal.id}
                            decoration="left"
                            decorationColor={getCategoryColor(goal.category)}
                        >
                            <Flex justifyContent="between" alignItems="center">
                                <Flex className="space-x-2" alignItems="center">
                                    <TargetIcon className="w-5 h-5 text-tremor-content-subtle" />
                                    <Text>{goal.title}</Text>
                                </Flex>
                                {goal.isCompleted && (
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                )}
                            </Flex>

                            <Flex justifyContent="between" alignItems="center" className="mt-4">
                                <BadgeDelta
                                    deltaType="unchanged"
                                    size="xs"
                                >
                                    {goal.category}
                                </BadgeDelta>
                                <Text>
                                    {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
                                </Text>
                            </Flex>

                            <Flex justifyContent="between" alignItems="center" className="mt-3">
                                <Text>Progress</Text>
                                <BadgeDelta deltaType={deltaType} size="xs">
                                    {percentage}%
                                </BadgeDelta>
                            </Flex>

                            <ProgressBar
                                value={percentage}
                                color={getCategoryColor(goal.category)}
                                className="mt-2"
                            />

                            <Flex justifyContent="between" className="mt-3">
                                <Text className="text-tremor-content-subtle text-xs">
                                    Due: {new Date(goal.dueDate).toLocaleDateString()}
                                </Text>
                                <Text className="text-tremor-content-subtle text-xs">
                                    {goal.target - goal.current > 0
                                        ? `${goal.target - goal.current} ${goal.unit} remaining`
                                        : 'Goal achieved!'
                                    }
                                </Text>
                            </Flex>
                        </Card>
                    );
                })}
            </Grid>

            <Card className="mt-4">
                <Flex justifyContent="between" alignItems="center">
                    <Text>Overall Progress</Text>
                    <BadgeDelta
                        deltaType={getProgressDeltaType(overallProgress)}
                    >
                        {overallProgress}% Complete
                    </BadgeDelta>
                </Flex>
                <ProgressBar
                    value={overallProgress}
                    color="emerald"
                    className="mt-2"
                />
            </Card>
        </Card>
    );
} 