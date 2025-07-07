import React from 'react';
import {
    ChartBarIcon,
    DocumentChartBarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
    CurrencyDollarIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../../core/cards';
import { Typography } from '../../core/typography';
import { Button } from '../../core/buttons';
import { QuickActionButton, MetricCard, RoadmapItem } from '../../core/patterns';

interface ReportsPageProps {
    title?: string;
    className?: string;
}

/**
 * Reports Page - Placeholder component for future analytics and reporting features
 */
export const ReportsPage: React.FC<ReportsPageProps> = ({
    title = 'Reports & Analytics',
    className
}) => {
    const plannedReports = [
        {
            icon: <ArrowTrendingUpIcon className="h-8 w-8 text-primary-500" />,
            title: 'Sales Performance',
            description: 'Track revenue trends, deal velocity, and conversion rates',
            category: 'Sales Analytics'
        },
        {
            icon: <UsersIcon className="h-8 w-8 text-accent-500" />,
            title: 'Contact Insights',
            description: 'Analyze contact engagement and relationship strength',
            category: 'Relationship Analytics'
        },
        {
            icon: <CurrencyDollarIcon className="h-8 w-8 text-warm-500" />,
            title: 'Revenue Forecasting',
            description: 'Predict future revenue based on pipeline data',
            category: 'Financial Analytics'
        },
        {
            icon: <CalendarIcon className="h-8 w-8 text-secondary-500" />,
            title: 'Activity Reports',
            description: 'Monitor team activities and productivity metrics',
            category: 'Operational Analytics'
        },
        {
            icon: <DocumentChartBarIcon className="h-8 w-8 text-error-500" />,
            title: 'Custom Dashboards',
            description: 'Build personalized reports with drag-and-drop widgets',
            category: 'Custom Analytics'
        },
        {
            icon: <ChartBarIcon className="h-8 w-8 text-success-500" />,
            title: 'Territory Analysis',
            description: 'Geographic performance and market penetration insights',
            category: 'Geographic Analytics'
        }
    ];

    const reportCategories = ['All', 'Sales Analytics', 'Relationship Analytics', 'Financial Analytics', 'Operational Analytics'];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <ChartBarIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Gain insights into your business performance with comprehensive analytics
                                </Typography>
                            </div>
                        </div>
                        
                        <QuickActionButton
                            label="Create Report"
                            icon={<DocumentChartBarIcon className="h-4 w-4" />}
                            onClick={() => console.log('Create report')}
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
                    <ChartBarIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <Typography variant="h5" className="text-gray-600 mb-4">
                        Advanced Analytics Coming Soon
                    </Typography>
                    <Typography variant="body1" className="text-gray-500 mb-8 max-w-2xl mx-auto">
                        We're developing a comprehensive analytics platform that will provide deep insights 
                        into your sales performance, customer relationships, and business growth opportunities. 
                        Advanced reporting features will be available in the next major release.
                    </Typography>
                    
                    <div className="flex justify-center space-x-4">
                        <Button variant="outlined" disabled>
                            View Dashboard
                        </Button>
                        <Button variant="outlined" disabled>
                            Export Data
                        </Button>
                        <Button variant="outlined" disabled>
                            Schedule Reports
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Report Categories */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="text-secondary-800">
                        Planned Report Categories
                    </Typography>
                    <div className="flex space-x-2">
                        {reportCategories.map((category) => (
                            <Button
                                key={category}
                                variant={category === 'All' ? 'contained' : 'outlined'}
                                size="sm"
                                disabled
                                className="opacity-50"
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plannedReports.map((report, index) => (
                        <Card key={index} className="border-2 border-dashed border-gray-200 hover:border-primary-200 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {report.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Typography variant="h6" className="text-secondary-800">
                                                {report.title}
                                            </Typography>
                                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-700">
                                                Planned
                                            </div>
                                        </div>
                                        <Typography variant="body2" className="text-gray-600 mb-3">
                                            {report.description}
                                        </Typography>
                                        <Typography variant="caption" className="text-gray-500">
                                            Category: {report.category}
                                        </Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Placeholder Analytics Grid */}
            <div>
                <Typography variant="h6" className="text-secondary-800 mb-4">
                    Quick Metrics (Preview)
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={<ArrowTrendingUpIcon />}
                        value="--"
                        label="Revenue Growth"
                        disabled
                    />
                    <MetricCard
                        icon={<UsersIcon />}
                        value="--"
                        label="Active Contacts"
                        disabled
                    />
                    <MetricCard
                        icon={<CurrencyDollarIcon />}
                        value="--"
                        label="Pipeline Value"
                        disabled
                    />
                    <MetricCard
                        icon={<CalendarIcon />}
                        value="--"
                        label="Activities This Month"
                        disabled
                    />
                </div>
            </div>

            {/* Feature Timeline */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" className="text-secondary-800">
                        Development Roadmap
                    </Typography>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <RoadmapItem
                            title="Phase 1: Basic Reporting (Q2 2024)"
                            description="Contact lists, organization summaries, basic export functionality"
                            isActive
                        />
                        <RoadmapItem
                            title="Phase 2: Advanced Analytics (Q3 2024)"
                            description="Sales performance metrics, revenue forecasting, trend analysis"
                        />
                        <RoadmapItem
                            title="Phase 3: Custom Dashboards (Q4 2024)"
                            description="Personalized reports, scheduled exports, team collaboration features"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;