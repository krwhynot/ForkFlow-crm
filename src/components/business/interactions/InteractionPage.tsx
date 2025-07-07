import React from 'react';
import {
    ChatBubbleLeftRightIcon,
    PlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarDaysIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader } from '../../core/cards';
import { Typography } from '../../core/typography';
import { Button } from '../../core/buttons';
import { 
    PageHeader,
    StatusBadge,
    FeatureList,
    TimelineItem,
    ActionButtonGroup,
    ActionButton
} from '../../core/patterns';

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

    const headerActions = (
        <Button
            variant="contained"
            size="sm"
            disabled
            startIcon={<PlusIcon className="h-4 w-4" />}
        >
            Log Interaction
        </Button>
    );

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <PageHeader
                title={title}
                subtitle="Track all touchpoints and communications with your contacts"
                icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-500" />}
                actions={headerActions}
            />

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
                    
                    <ActionButtonGroup
                        actions={[
                            { label: 'View Timeline', disabled: true },
                            { label: 'Schedule Follow-up', disabled: true },
                            { label: 'Export History', disabled: true }
                        ]}
                    />
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
                                            <StatusBadge status={type.status as any} />
                                        </div>
                                        <Typography variant="body2" className="text-gray-600 mb-3">
                                            {type.description}
                                        </Typography>
                                        <FeatureList features={type.features} />
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
                        <TimelineItem
                            icon={<PhoneIcon className="h-5 w-5 text-primary-500" />}
                            title="Phone Call with John Smith"
                            subtitle="Discussed Q2 product requirements and pricing options..."
                            timestamp="2 hours ago"
                            metadata={
                                <div className="flex items-center space-x-4">
                                    <span className="flex items-center space-x-1">
                                        <ClockIcon className="h-3 w-3" />
                                        <span>15 min</span>
                                    </span>
                                    <span>Follow-up: Schedule demo</span>
                                </div>
                            }
                            disabled
                        />

                        <TimelineItem
                            icon={<EnvelopeIcon className="h-5 w-5 text-accent-500" />}
                            title="Email to Sarah Johnson"
                            subtitle="Sent product catalog and pricing information..."
                            timestamp="Yesterday"
                            metadata={
                                <div className="flex items-center space-x-4">
                                    <span>Status: Opened</span>
                                    <span>Response: Pending</span>
                                </div>
                            }
                            disabled
                        />

                        <TimelineItem
                            icon={<CalendarDaysIcon className="h-5 w-5 text-warm-500" />}
                            title="Meeting at ABC Restaurant"
                            subtitle="Product tasting session and kitchen tour..."
                            timestamp="Last week"
                            metadata={
                                <div className="flex items-center space-x-4">
                                    <span>3 attendees</span>
                                    <span>Outcome: Positive</span>
                                </div>
                            }
                            disabled
                        />
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
                        <div className="space-y-1">
                            <FeatureList 
                                features={upcomingFeatures.slice(0, 3)} 
                                variant="dots"
                                size="md"
                            />
                        </div>
                        <div className="space-y-1">
                            <FeatureList 
                                features={upcomingFeatures.slice(3)} 
                                variant="dots"
                                size="md"
                            />
                        </div>
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