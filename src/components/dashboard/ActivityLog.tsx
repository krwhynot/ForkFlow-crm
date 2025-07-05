import {
    ArrowTrendingUpIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    ClockIcon,
    DocumentTextIcon,
    PhoneIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Activity {
    id: string;
    type: 'contact_created' | 'organization_created' | 'interaction_logged' | 'opportunity_created' | 'meeting_scheduled' | 'note_added';
    title: string;
    description: string;
    user: string;
    timestamp: string;
    entityName: string;
    entityType: 'contact' | 'organization' | 'interaction' | 'opportunity' | 'meeting' | 'note';
}

// Mock data - replace with actual hook
const mockActivities: Activity[] = [
    {
        id: '1',
        type: 'contact_created',
        title: 'New Contact Added',
        description: 'Sarah Johnson added as Purchasing Manager at Olive Garden',
        user: 'John Doe',
        timestamp: '2024-01-14T10:30:00Z',
        entityName: 'Sarah Johnson',
        entityType: 'contact'
    },
    {
        id: '2',
        type: 'interaction_logged',
        title: 'Phone Call Logged',
        description: 'Product discussion with Mike Chen at Sysco Corporation',
        user: 'Jane Smith',
        timestamp: '2024-01-14T09:15:00Z',
        entityName: 'Mike Chen',
        entityType: 'interaction'
    },
    {
        id: '3',
        type: 'opportunity_created',
        title: 'New Opportunity Created',
        description: 'Q1 Product Line Expansion opportunity for Whole Foods Market',
        user: 'Bob Wilson',
        timestamp: '2024-01-13T16:45:00Z',
        entityName: 'Q1 Product Line Expansion',
        entityType: 'opportunity'
    },
    {
        id: '4',
        type: 'meeting_scheduled',
        title: 'Meeting Scheduled',
        description: 'Quarterly Business Review with Restaurant Depot',
        user: 'Alice Brown',
        timestamp: '2024-01-13T14:20:00Z',
        entityName: 'Quarterly Business Review',
        entityType: 'meeting'
    },
    {
        id: '5',
        type: 'organization_created',
        title: 'New Organization Added',
        description: 'Fresh Market Distributors added as potential distributor',
        user: 'John Doe',
        timestamp: '2024-01-12T11:10:00Z',
        entityName: 'Fresh Market Distributors',
        entityType: 'organization'
    },
    {
        id: '6',
        type: 'note_added',
        title: 'Note Added',
        description: 'Follow-up notes added for Olive Garden meeting',
        user: 'Jane Smith',
        timestamp: '2024-01-12T08:30:00Z',
        entityName: 'Follow-up Notes',
        entityType: 'note'
    }
];

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'contact_created':
            return <UserIcon className="w-5 h-5 text-blue-500" />;
        case 'organization_created':
            return <BuildingOfficeIcon className="w-5 h-5 text-green-500" />;
        case 'interaction_logged':
            return <PhoneIcon className="w-5 h-5 text-purple-500" />;
        case 'opportunity_created':
            return <ArrowTrendingUpIcon className="w-5 h-5 text-orange-500" />;
        case 'meeting_scheduled':
            return <CalendarIcon className="w-5 h-5 text-indigo-500" />;
        case 'note_added':
            return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
        default:
            return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
};

const getActivityColor = (type: Activity['type']) => {
    switch (type) {
        case 'contact_created':
            return 'bg-blue-100 text-blue-800';
        case 'organization_created':
            return 'bg-green-100 text-green-800';
        case 'interaction_logged':
            return 'bg-purple-100 text-purple-800';
        case 'opportunity_created':
            return 'bg-orange-100 text-orange-800';
        case 'meeting_scheduled':
            return 'bg-indigo-100 text-indigo-800';
        case 'note_added':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }
};

export default function ActivityLog() {
    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-500" />
                        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                            Activity Log
                        </Typography>
                    </div>
                    <Chip className="bg-gray-100 text-gray-800 text-xs">
                        Recent Activity
                    </Chip>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {mockActivities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle activity click
                                }
                            }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getActivityIcon(activity.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="body2" className="font-medium text-gray-900">
                                        {activity.title}
                                    </Typography>
                                    <Typography variant="body2" className="text-xs text-gray-500">
                                        {formatTimeAgo(activity.timestamp)}
                                    </Typography>
                                </div>

                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    {activity.description}
                                </Typography>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Avatar
                                            name={activity.user}
                                            size="sm"
                                            className="w-5 h-5"
                                        />
                                        <Typography variant="body2" className="text-sm text-gray-500">
                                            {activity.user}
                                        </Typography>
                                    </div>

                                    <Chip className={getActivityColor(activity.type)}>
                                        {activity.type.replace('_', ' ')}
                                    </Chip>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View Full Activity Log
                    </button>
                </div>
            </div>
        </Card>
    );
} 