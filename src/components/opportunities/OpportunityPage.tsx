import React from 'react';
import {
    ArrowTrendingUpIcon as TrendingUpIcon,
    PlusIcon,
    ChartBarIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../ui-kit/Card';
import { Typography } from '../ui-kit/Typography';
import { Button } from '../ui-kit/Button';
import { QuickActionButton } from '../ui-kit/QuickActionButton';

interface OpportunityPageProps {
    title?: string;
    className?: string;
}

/**
 * Opportunity Page - Placeholder component for future sales pipeline implementation
 */
export const OpportunityPage: React.FC<OpportunityPageProps> = ({
    title = 'Opportunities',
    className
}) => {
    const upcomingFeatures = [
        {
            icon: <ChartBarIcon className="h-8 w-8 text-primary-500" />,
            title: 'Sales Pipeline',
            description: 'Visual kanban board to track deals through your sales process',
            status: 'Coming Soon'
        },
        {
            icon: <CurrencyDollarIcon className="h-8 w-8 text-warm-500" />,
            title: 'Revenue Forecasting',
            description: 'Predict future revenue based on current opportunities',
            status: 'Planned'
        },
        {
            icon: <CalendarDaysIcon className="h-8 w-8 text-accent-500" />,
            title: 'Deal Timeline',
            description: 'Track important dates and milestones for each opportunity',
            status: 'In Development'
        }
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <TrendingUpIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Track and manage your sales opportunities
                                </Typography>
                            </div>
                        </div>
                        
                        <QuickActionButton
                            label="Add Opportunity"
                            icon={<PlusIcon className="h-4 w-4" />}
                            onClick={() => console.log('Add opportunity')}
                            variant="primary"
                            size="sm"
                            disabled
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Under Construction Notice */}
            <Card>
                <CardContent className="text-center py-16">
                    <TrendingUpIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <Typography variant="h5" className="text-gray-600 mb-4">
                        Opportunities Module Under Construction
                    </Typography>
                    <Typography variant="body1" className="text-gray-500 mb-8 max-w-2xl mx-auto">
                        We're building a comprehensive sales pipeline management system to help you track 
                        deals, forecast revenue, and optimize your sales process. This feature will be 
                        available in an upcoming release.
                    </Typography>
                    
                    <div className="flex justify-center space-x-4">
                        <Button variant="outlined" disabled>
                            View Pipeline
                        </Button>
                        <Button variant="outlined" disabled>
                            Add Deal
                        </Button>
                        <Button variant="outlined" disabled>
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Features */}
            <div>
                <Typography variant="h6" className="text-secondary-800 mb-4">
                    Planned Features
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {upcomingFeatures.map((feature, index) => (
                        <Card key={index} className="border-2 border-dashed border-gray-200">
                            <CardContent className="text-center py-8">
                                <div className="mb-4">
                                    {feature.icon}
                                </div>
                                <Typography variant="h6" className="text-secondary-800 mb-2">
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" className="text-gray-600 mb-4">
                                    {feature.description}
                                </Typography>
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                                    {feature.status}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Placeholder Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Open Deals
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Pipeline Value
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Win Rate
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Avg. Deal Size
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OpportunityPage;