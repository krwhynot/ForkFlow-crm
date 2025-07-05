import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import {
    BadgeDelta,
    Card,
    Color,
    Flex,
    Grid,
    Metric,
    ProgressBar,
    Tab,
    TabGroup,
    TabList,
    Text,
    Title
} from '@tremor/react';
import React from 'react';
import { Avatar } from '../ui-kit/Avatar';

interface Opportunity {
    id: string;
    title: string;
    organization: string;
    value: number;
    stage: string;
    priority: 'high' | 'medium' | 'low';
    assignedTo: string;
    dueDate: string;
    probability: number;
    principal: string;
}

interface Stage {
    id: string;
    name: string;
    color: Color;
    opportunities: Opportunity[];
}

// Mock data - replace with actual hook
const mockOpportunities: Opportunity[] = [
    {
        id: '1',
        title: 'Q1 Product Line Expansion',
        organization: 'Olive Garden',
        value: 75000,
        stage: 'prospecting',
        priority: 'high',
        assignedTo: 'John Doe',
        dueDate: '2024-01-25',
        probability: 25,
        principal: 'Farm Fresh Foods'
    },
    {
        id: '2',
        title: 'Seasonal Menu Integration',
        organization: 'Sysco Corporation',
        value: 120000,
        stage: 'qualification',
        priority: 'high',
        assignedTo: 'Jane Smith',
        dueDate: '2024-01-30',
        probability: 50,
        principal: 'Golden Grain Bakery'
    },
    {
        id: '3',
        title: 'Bulk Purchase Agreement',
        organization: 'Whole Foods Market',
        value: 45000,
        stage: 'proposal',
        priority: 'medium',
        assignedTo: 'Bob Wilson',
        dueDate: '2024-02-05',
        probability: 75,
        principal: 'Mediterranean Imports'
    },
    {
        id: '4',
        title: 'Premium Product Launch',
        organization: 'Restaurant Depot',
        value: 95000,
        stage: 'negotiation',
        priority: 'high',
        assignedTo: 'Alice Brown',
        dueDate: '2024-02-10',
        probability: 85,
        principal: 'Ranch Direct'
    },
    {
        id: '5',
        title: 'Regional Distribution Deal',
        organization: 'Fresh Market',
        value: 180000,
        stage: 'prospecting',
        priority: 'medium',
        assignedTo: 'John Doe',
        dueDate: '2024-02-15',
        probability: 20,
        principal: 'Farm Fresh Foods'
    }
];

const stages: Stage[] = [
    {
        id: 'prospecting',
        name: 'Prospecting',
        color: 'slate',
        opportunities: mockOpportunities.filter(opp => opp.stage === 'prospecting')
    },
    {
        id: 'qualification',
        name: 'Qualification',
        color: 'blue',
        opportunities: mockOpportunities.filter(opp => opp.stage === 'qualification')
    },
    {
        id: 'proposal',
        name: 'Proposal',
        color: 'amber',
        opportunities: mockOpportunities.filter(opp => opp.stage === 'proposal')
    },
    {
        id: 'negotiation',
        name: 'Negotiation',
        color: 'orange',
        opportunities: mockOpportunities.filter(opp => opp.stage === 'negotiation')
    },
    {
        id: 'closed',
        name: 'Closed Won',
        color: 'emerald',
        opportunities: mockOpportunities.filter(opp => opp.stage === 'closed')
    }
];

const getPriorityColor = (priority: Opportunity['priority']): Color => {
    switch (priority) {
        case 'high':
            return 'rose';
        case 'medium':
            return 'amber';
        case 'low':
            return 'emerald';
        default:
            return 'slate';
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => (
    <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        decoration="top"
        decorationColor={getPriorityColor(opportunity.priority)}
    >
        <Flex justifyContent="between" alignItems="start">
            <Text className="font-medium">{opportunity.title}</Text>
            <BadgeDelta
                deltaType={opportunity.priority === 'high' ? 'increase' : opportunity.priority === 'medium' ? 'moderateIncrease' : 'unchanged'}
                size="xs"
            >
                {opportunity.priority}
            </BadgeDelta>
        </Flex>

        <Text className="mt-2 text-tremor-default text-tremor-content">{opportunity.organization}</Text>

        <Flex className="mt-4" justifyContent="between">
            <Text>{formatCurrency(opportunity.value)}</Text>
            <Text>{opportunity.probability}% probability</Text>
        </Flex>

        <ProgressBar value={opportunity.probability} color={getPriorityColor(opportunity.priority)} className="mt-2" />

        <Flex className="mt-4" justifyContent="between">
            <Text className="text-tremor-content-emphasis">{opportunity.principal}</Text>
            <Text className="text-tremor-content">Due {formatDate(opportunity.dueDate)}</Text>
        </Flex>

        <Flex className="mt-4" alignItems="center">
            <Avatar
                name={opportunity.assignedTo}
                size="sm"
                className="w-5 h-5"
            />
            <Text className="ml-2">{opportunity.assignedTo}</Text>
        </Flex>
    </Card>
);

export default function KanbanBoard() {
    const totalValue = mockOpportunities.reduce((sum, opp) => sum + opp.value, 0);
    const totalOpportunities = mockOpportunities.length;
    const avgProbability = Math.round(
        mockOpportunities.reduce((sum, opp) => sum + opp.probability, 0) / totalOpportunities
    );

    return (
        <Card>
            <Flex className="space-x-8" justifyContent="between">
                <div>
                    <Flex alignItems="center">
                        <ArrowTrendingUpIcon className="w-6 h-6 text-tremor-content-emphasis mr-2" />
                        <Title>Opportunity Pipeline</Title>
                    </Flex>
                    <Text className="mt-2">Track and manage your sales opportunities</Text>
                </div>
                <Grid numItems={3} className="gap-6">
                    <Card decoration="top" decorationColor="emerald">
                        <Text>Total Value</Text>
                        <Metric>{formatCurrency(totalValue)}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="blue">
                        <Text>Opportunities</Text>
                        <Metric>{totalOpportunities}</Metric>
                    </Card>
                    <Card decoration="top" decorationColor="amber">
                        <Text>Avg. Probability</Text>
                        <Metric>{avgProbability}%</Metric>
                    </Card>
                </Grid>
            </Flex>

            <TabGroup className="mt-6">
                <TabList>
                    {stages.map((stage) => (
                        <Tab key={stage.id} className="px-4 py-2">
                            <Flex alignItems="center" justifyContent="between">
                                <Text>{stage.name}</Text>
                                <BadgeDelta deltaType="unchanged" size="xs">
                                    {stage.opportunities.length}
                                </BadgeDelta>
                            </Flex>
                        </Tab>
                    ))}
                </TabList>
            </TabGroup>

            <Grid numItems={5} className="gap-4 mt-6">
                {stages.map((stage) => (
                    <div key={stage.id} className="space-y-4">
                        <Card decoration="left" decorationColor={stage.color}>
                            <Flex justifyContent="between" alignItems="center">
                                <Text>{stage.name}</Text>
                                <BadgeDelta deltaType="unchanged">
                                    {stage.opportunities.length}
                                </BadgeDelta>
                            </Flex>
                        </Card>
                        <div className="space-y-4">
                            {stage.opportunities.map((opportunity) => (
                                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                            ))}
                        </div>
                    </div>
                ))}
            </Grid>
        </Card>
    );
} 