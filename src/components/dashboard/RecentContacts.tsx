import { BuildingOfficeIcon, EnvelopeIcon, PhoneIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Contact {
    id: string;
    name: string;
    title: string;
    organization: string;
    email: string;
    phone: string;
    addedDate: string;
    addedBy: string;
    type: 'primary' | 'secondary' | 'assistant';
    status: 'active' | 'inactive';
}

// Mock data - replace with actual hook
const mockContacts: Contact[] = [
    {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Purchasing Manager',
        organization: 'Olive Garden',
        email: 'sarah.johnson@olivegarden.com',
        phone: '(555) 123-4567',
        addedDate: '2024-01-14T10:30:00Z',
        addedBy: 'John Doe',
        type: 'primary',
        status: 'active'
    },
    {
        id: '2',
        name: 'Mike Chen',
        title: 'Regional Director',
        organization: 'Sysco Corporation',
        email: 'mike.chen@sysco.com',
        phone: '(555) 987-6543',
        addedDate: '2024-01-13T14:15:00Z',
        addedBy: 'Jane Smith',
        type: 'primary',
        status: 'active'
    },
    {
        id: '3',
        name: 'Lisa Rodriguez',
        title: 'Category Manager',
        organization: 'Whole Foods Market',
        email: 'lisa.rodriguez@wholefoods.com',
        phone: '(555) 456-7890',
        addedDate: '2024-01-12T09:45:00Z',
        addedBy: 'Bob Wilson',
        type: 'secondary',
        status: 'active'
    },
    {
        id: '4',
        name: 'David Kim',
        title: 'Assistant Buyer',
        organization: 'Restaurant Depot',
        email: 'david.kim@restaurantdepot.com',
        phone: '(555) 234-5678',
        addedDate: '2024-01-11T16:20:00Z',
        addedBy: 'Alice Brown',
        type: 'assistant',
        status: 'active'
    }
];

const getTypeColor = (type: Contact['type']) => {
    switch (type) {
        case 'primary':
            return 'bg-blue-100 text-blue-800';
        case 'secondary':
            return 'bg-green-100 text-green-800';
        case 'assistant':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status: Contact['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-red-100 text-red-800';
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
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }
};

export default function RecentContacts() {
    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <UserPlusIcon className="w-5 h-5 text-green-500" />
                        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                            Recent Contacts
                        </Typography>
                    </div>
                    <Chip className="bg-green-100 text-green-800 text-xs">
                        {mockContacts.length} New
                    </Chip>
                </div>

                <div className="space-y-3">
                    {mockContacts.map((contact) => (
                        <div
                            key={contact.id}
                            className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle contact click
                                }
                            }}
                        >
                            <Avatar
                                name={contact.name}
                                size="md"
                                className="w-10 h-10 flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <Typography variant="body2" className="font-medium text-gray-900">
                                        {contact.name}
                                    </Typography>
                                    <Typography variant="body2" className="text-xs text-gray-500">
                                        {formatTimeAgo(contact.addedDate)}
                                    </Typography>
                                </div>

                                <Typography variant="body2" className="text-gray-600 mb-2">
                                    {contact.title}
                                </Typography>

                                <div className="flex items-center space-x-2 mb-2">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                    <Typography variant="body2" className="text-gray-600">
                                        {contact.organization}
                                    </Typography>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Chip className={getTypeColor(contact.type)}>
                                        {contact.type}
                                    </Chip>
                                    <Chip className={getStatusColor(contact.status)}>
                                        {contact.status}
                                    </Chip>
                                </div>

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                        <EnvelopeIcon className="w-4 h-4" />
                                        <span className="truncate">{contact.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <PhoneIcon className="w-4 h-4" />
                                        <span>{contact.phone}</span>
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-gray-500">
                                    Added by {contact.addedBy}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View All Contacts
                    </button>
                </div>
            </div>
        </Card>
    );
} 