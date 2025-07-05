import { BuildingOfficeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/solid';
import { Avatar } from '../ui-kit/Avatar';
import { Card } from '../ui-kit/Card';
import { Chip } from '../ui-kit/Chip';
import { Typography } from '../ui-kit/Typography';

interface Organization {
    id: string;
    name: string;
    type: 'restaurant' | 'distributor' | 'retailer';
    priority: 'A' | 'B' | 'C';
    revenue: number;
    lastInteraction: string;
    primaryContact: string;
    phone: string;
    status: 'active' | 'inactive' | 'prospect';
    opportunityCount: number;
    location: string;
}

// Mock data - replace with actual hook
const mockOrganizations: Organization[] = [
    {
        id: '1',
        name: 'Olive Garden',
        type: 'restaurant',
        priority: 'A',
        revenue: 250000,
        lastInteraction: '2024-01-12',
        primaryContact: 'Sarah Johnson',
        phone: '(555) 123-4567',
        status: 'active',
        opportunityCount: 3,
        location: 'Orlando, FL'
    },
    {
        id: '2',
        name: 'Sysco Corporation',
        type: 'distributor',
        priority: 'A',
        revenue: 500000,
        lastInteraction: '2024-01-11',
        primaryContact: 'Mike Chen',
        phone: '(555) 987-6543',
        status: 'active',
        opportunityCount: 5,
        location: 'Houston, TX'
    },
    {
        id: '3',
        name: 'Whole Foods Market',
        type: 'retailer',
        priority: 'A',
        revenue: 180000,
        lastInteraction: '2024-01-10',
        primaryContact: 'Lisa Rodriguez',
        phone: '(555) 456-7890',
        status: 'active',
        opportunityCount: 2,
        location: 'Austin, TX'
    }
];

const getTypeColor = (type: Organization['type']) => {
    switch (type) {
        case 'restaurant':
            return 'bg-orange-100 text-orange-800';
        case 'distributor':
            return 'bg-blue-100 text-blue-800';
        case 'retailer':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status: Organization['status']) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-red-100 text-red-800';
        case 'prospect':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

export default function APriorityOrganizations() {
    const aPriorityOrgs = mockOrganizations.filter(org => org.priority === 'A');

    return (
        <Card className="h-full">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <StarIcon className="w-5 h-5 text-yellow-500" />
                        <Typography variant="h3" className="text-lg font-semibold text-gray-900">
                            A-Priority Organizations
                        </Typography>
                    </div>
                    <Chip className="bg-yellow-100 text-yellow-800 text-xs">
                        {aPriorityOrgs.length} Organizations
                    </Chip>
                </div>

                <div className="space-y-4">
                    {aPriorityOrgs.map((org) => (
                        <div
                            key={org.id}
                            className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    // Handle organization click
                                }
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        name={org.name}
                                        size="md"
                                        className="w-10 h-10"
                                    />
                                    <div>
                                        <Typography variant="body1" className="font-semibold text-gray-900">
                                            {org.name}
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-500">
                                            {org.location}
                                        </Typography>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <StarIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-yellow-600">A</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <Chip className={getTypeColor(org.type)}>
                                    {org.type}
                                </Chip>
                                <Chip className={getStatusColor(org.status)}>
                                    {org.status}
                                </Chip>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-gray-600">Revenue:</span>
                                    <span className="font-medium">{formatCurrency(org.revenue)}</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />
                                    <span className="text-gray-600">Opportunities:</span>
                                    <span className="font-medium">{org.opportunityCount}</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{org.primaryContact}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{org.phone}</span>
                                    </div>
                                </div>

                                <div className="mt-2 text-xs text-gray-500">
                                    Last interaction: {getDaysAgo(org.lastInteraction)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm py-2 transition-colors">
                        View All Organizations
                    </button>
                </div>
            </div>
        </Card>
    );
} 