import { CalendarDaysIcon, ClockIcon, MapPinIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Meeting {
    id: string;
    title: string;
    organization: string;
    contact: string;
    date: string;
    time: string;
    location?: string;
    isVirtual: boolean;
    type: 'meeting' | 'call' | 'presentation' | 'demo';
    status: 'scheduled' | 'confirmed' | 'tentative';
}

// Mock data - replace with actual hook
const mockMeetings: Meeting[] = [
    {
        id: '1',
        title: 'Product Line Review',
        organization: 'Olive Garden',
        contact: 'Sarah Johnson',
        date: '2024-01-15',
        time: '10:00 AM',
        location: 'Olive Garden HQ',
        isVirtual: false,
        type: 'meeting',
        status: 'confirmed'
    },
    {
        id: '2',
        title: 'Quarterly Business Review',
        organization: 'Sysco',
        contact: 'Mike Chen',
        date: '2024-01-16',
        time: '2:00 PM',
        isVirtual: true,
        type: 'presentation',
        status: 'confirmed'
    },
    {
        id: '3',
        title: 'New Product Demo',
        organization: 'Whole Foods',
        contact: 'Lisa Rodriguez',
        date: '2024-01-17',
        time: '11:30 AM',
        location: 'Whole Foods Regional Office',
        isVirtual: false,
        type: 'demo',
        status: 'tentative'
    }
];

const getMeetingTypeColor = (type: Meeting['type']) => {
    switch (type) {
        case 'meeting':
            return 'bg-blue-100 text-blue-800';
        case 'call':
            return 'bg-green-100 text-green-800';
        case 'presentation':
            return 'bg-purple-100 text-purple-800';
        case 'demo':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'tentative':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
};

export default function UpcomingMeetings() {
    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                        Upcoming Meetings
                    </Typography>
                    <Chip className="bg-blue-100 text-blue-800 text-xs">
                        {mockMeetings.length} Scheduled
                    </Chip>
                </div>

                <div className="space-y-3">
                    {mockMeetings.map((meeting) => (
                        <div
                            key={meeting.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle meeting click
                                }
                            }}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <CalendarDaysIcon className="w-5 h-5 text-blue-500" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Typography variant="body2" className="font-medium text-gray-900 mb-1">
                                    {meeting.title}
                                </Typography>

                                <div className="flex items-center space-x-2 mb-2">
                                    <Avatar
                                        name={meeting.contact}
                                        size="sm"
                                        className="w-6 h-6"
                                    />
                                    <Typography variant="body2" className="text-gray-600">
                                        {meeting.contact} • {meeting.organization}
                                    </Typography>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Chip className={getMeetingTypeColor(meeting.type)}>
                                        {meeting.type}
                                    </Chip>
                                    <Chip className={getStatusColor(meeting.status)}>
                                        {meeting.status}
                                    </Chip>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{formatDateForDisplay(meeting.date)} at {meeting.time}</span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                                    {meeting.isVirtual ? (
                                        <>
                                            <VideoCameraIcon className="w-4 h-4" />
                                            <span>Virtual Meeting</span>
                                        </>
                                    ) : (
                                        <>
                                            <MapPinIcon className="w-4 h-4" />
                                            <span>{meeting.location}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View Calendar
                    </button>
                </div>
            </div>
        </Card>
    );
} 