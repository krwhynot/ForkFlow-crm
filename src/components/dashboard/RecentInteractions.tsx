import { CalendarIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Interaction {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    title: string;
    organization: string;
    contact: string;
    date: string;
    needsFollowUp: boolean;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'completed';
}

// Mock data - replace with actual hook
const mockInteractions: Interaction[] = [
    {
        id: '1',
        type: 'call',
        title: 'Product discussion with purchasing manager',
        organization: 'Olive Garden',
        contact: 'Sarah Johnson',
        date: '2024-01-12',
        needsFollowUp: true,
        priority: 'high',
        status: 'pending'
    },
    {
        id: '2',
        type: 'meeting',
        title: 'Quarterly review meeting',
        organization: 'Sysco',
        contact: 'Mike Chen',
        date: '2024-01-11',
        needsFollowUp: true,
        priority: 'medium',
        status: 'pending'
    },
    {
        id: '3',
        type: 'email',
        title: 'New product catalog request',
        organization: 'Whole Foods',
        contact: 'Lisa Rodriguez',
        date: '2024-01-10',
        needsFollowUp: false,
        priority: 'low',
        status: 'completed'
    }
];

const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
        case 'call':
            return <PhoneIcon className="w-5 h-5 text-blue-500" />;
        case 'email':
            return <EnvelopeIcon className="w-5 h-5 text-green-500" />;
        case 'meeting':
            return <CalendarIcon className="w-5 h-5 text-purple-500" />;
        default:
            return <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500" />;
    }
};

const getPriorityColor = (priority: Interaction['priority']) => {
    switch (priority) {
        case 'high':
            return 'bg-red-100 text-red-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function RecentInteractions() {
    const followUpInteractions = mockInteractions.filter(i => i.needsFollowUp);

    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                        Recent Interactions
                    </Typography>
                    <Chip className="bg-orange-100 text-orange-800 text-xs">
                        {followUpInteractions.length} Need Follow-up
                    </Chip>
                </div>

                <div className="space-y-3">
                    {mockInteractions.map((interaction) => (
                        <div
                            key={interaction.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${interaction.needsFollowUp
                                    ? 'border-orange-200 bg-orange-50 hover:bg-orange-100'
                                    : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle interaction click
                                }
                            }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                {getInteractionIcon(interaction.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <Typography variant="body2" className="font-medium text-gray-900 mb-1">
                                    {interaction.title}
                                </Typography>

                                <div className="flex items-center space-x-2 mb-2">
                                    <Avatar
                                        name={interaction.contact}
                                        size="sm"
                                        className="w-6 h-6"
                                    />
                                    <Typography variant="body2" className="text-gray-600">
                                        {interaction.contact} • {interaction.organization}
                                    </Typography>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Chip className={getPriorityColor(interaction.priority)}>
                                        {interaction.priority}
                                    </Chip>
                                    {interaction.needsFollowUp && (
                                        <Chip className="bg-orange-100 text-orange-800">
                                            Follow-up Required
                                        </Chip>
                                    )}
                                </div>

                                <Typography variant="body2" className="text-gray-500">
                                    {new Date(interaction.date).toLocaleDateString()}
                                </Typography>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View All Interactions
                    </button>
                </div>
            </div>
        </Card>
    );
} 