import React from 'react';
import {
    ChatBubbleLeftRightIcon,
    PlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    UserGroupIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../ui-kit/Card';
import { Typography } from '../ui-kit/Typography';
import { Button } from '../ui-kit/Button';
import { QuickActionButton } from '../ui-kit/QuickActionButton';

interface InteractionPageProps {
    title?: string;
    className?: string;
}

/**
 * Interaction Page - Placeholder component for future interaction tracking and management
 */
export const InteractionPage: React.FC<InteractionPageProps> = ({
    title = 'Interactions',
    className
}) => {
    const interactionTypes = [
        {
            icon: <PhoneIcon className="h-8 w-8 text-primary-500" />,
            title: 'Phone Calls',
            description: 'Log and track phone conversations with contacts',
            status: 'Planned',
            features: ['Call duration tracking', 'Follow-up reminders', 'Call notes']
        },
        {
            icon: <EnvelopeIcon className="h-8 w-8 text-accent-500" />,
            title: 'Email Integration',
            description: 'Automatic email tracking and manual email logging',
            status: 'In Development',
            features: ['Email sync', 'Response tracking', 'Template library']
        },
        {
            icon: <CalendarDaysIcon className="h-8 w-8 text-warm-500" />,
            title: 'Meetings',
            description: 'Schedule and document in-person and virtual meetings',
            status: 'Coming Soon',
            features: ['Calendar integration', 'Meeting minutes', 'Attendee tracking']
        },
        {
            icon: <ChatBubbleLeftRightIcon className="h-8 w-8 text-success-500" />,
            title: 'Notes & Updates',
            description: 'Quick notes and relationship updates',
            status: 'Ready',
            features: ['Rich text editor', 'File attachments', 'Quick templates']
        }
    ];

    const upcomingFeatures = [
        'Automated interaction scoring',
        'Sentiment analysis',
        'Interaction timeline visualization',
        'Team collaboration on interactions',
        'Mobile interaction logging',
        'Integration with popular email clients'
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Track all touchpoints and communications with your contacts
                                </Typography>
                            </div>
                        </div>
                        
                        <QuickActionButton
                            label="Log Interaction"
                            icon={<PlusIcon className="h-4 w-4" />}
                            onClick={() => console.log('Log interaction')}
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
                    <ChatBubbleLeftRightIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                    <Typography variant="h5" className="text-gray-600 mb-4">
                        Interaction Tracking System In Progress
                    </Typography>
                    <Typography variant="body1" className="text-gray-500 mb-8 max-w-2xl mx-auto">
                        We're developing a comprehensive interaction tracking system that will help you 
                        maintain detailed records of all communications with your contacts. This includes 
                        phone calls, emails, meetings, and notes with automatic reminders and follow-up scheduling.
                    </Typography>
                    
                    <div className="flex justify-center space-x-4">
                        <Button variant="outlined" disabled>
                            View Timeline
                        </Button>
                        <Button variant="outlined" disabled>
                            Schedule Follow-up
                        </Button>
                        <Button variant="outlined" disabled>
                            Export History
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Interaction Types */}
            <div>
                <Typography variant="h6" className="text-secondary-800 mb-4">
                    Interaction Types & Features
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {interactionTypes.map((type, index) => (
                        <Card key={index} className="border-2 border-dashed border-gray-200">
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        {type.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Typography variant="h6" className="text-secondary-800">
                                                {type.title}
                                            </Typography>
                                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                type.status === 'Ready' ? 'bg-success-100 text-success-700' :
                                                type.status === 'In Development' ? 'bg-warning-100 text-warning-700' :
                                                'bg-primary-100 text-primary-700'
                                            }`}>
                                                {type.status}
                                            </div>
                                        </div>
                                        <Typography variant="body2" className="text-gray-600 mb-3">
                                            {type.description}
                                        </Typography>
                                        <div className="space-y-1">
                                            {type.features.map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                                                    <Typography variant="caption" className="text-gray-600">
                                                        {feature}
                                                    </Typography>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Sample Interaction Timeline */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" className="text-secondary-800">
                        Interaction Timeline (Preview)
                    </Typography>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Sample interaction items */}
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg opacity-60">
                            <div className="flex-shrink-0">
                                <PhoneIcon className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="subtitle2" className="text-secondary-800">
                                        Phone Call with John Smith
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-500">
                                        2 hours ago
                                    </Typography>
                                </div>
                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    Discussed Q2 product requirements and pricing options...
                                </Typography>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                        <ClockIcon className="h-3 w-3" />
                                        <span>15 min</span>
                                    </span>
                                    <span>Follow-up: Schedule demo</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg opacity-60">
                            <div className="flex-shrink-0">
                                <EnvelopeIcon className="h-5 w-5 text-accent-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="subtitle2" className="text-secondary-800">
                                        Email to Sarah Johnson
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-500">
                                        Yesterday
                                    </Typography>
                                </div>
                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    Sent product catalog and pricing information...
                                </Typography>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Status: Opened</span>
                                    <span>Response: Pending</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg opacity-60">
                            <div className="flex-shrink-0">
                                <CalendarDaysIcon className="h-5 w-5 text-warm-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="subtitle2" className="text-secondary-800">
                                        Meeting at ABC Restaurant
                                    </Typography>
                                    <Typography variant="caption" className="text-gray-500">
                                        Last week
                                    </Typography>
                                </div>
                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    Product tasting session and kitchen tour...
                                </Typography>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span className="flex items-center space-x-1">
                                        <UserGroupIcon className="h-3 w-3" />
                                        <span>3 attendees</span>
                                    </span>
                                    <span>Outcome: Positive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center mt-6 pt-4 border-t border-gray-200">
                        <Typography variant="caption" className="text-gray-500">
                            * This is a preview of the interaction timeline that will track all communications
                        </Typography>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Features */}
            <Card>
                <CardHeader>
                    <Typography variant="h6" className="text-secondary-800">
                        Upcoming Features
                    </Typography>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {upcomingFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-primary-50 rounded-lg">
                                <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                                <Typography variant="body2" className="text-primary-800">
                                    {feature}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Placeholder Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Total Interactions
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            This Week
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Follow-ups Due
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card className="opacity-50">
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-gray-400 font-bold">
                            --
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Response Rate
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InteractionPage;