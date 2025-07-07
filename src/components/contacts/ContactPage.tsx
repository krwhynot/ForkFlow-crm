import React, { useState, useMemo } from 'react';
import { useList, useResourceContext } from 'react-admin';
import {
    UserIcon,
    PlusIcon,
    PhoneIcon,
    EnvelopeIcon,
    BriefcaseIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { DataTable, Column, FilterConfig, SortConfig } from '../ui-kit/DataTable';
import { Button } from '../ui-kit/Button';
import { Typography } from '../ui-kit/Typography';
import { Chip } from '../ui-kit/Chip';
import { Avatar } from '../ui-kit/Avatar';
import { Box } from '../ui-kit/Box';
import { Card, CardContent, CardHeader } from '../ui-kit/Card';
import { FormInput } from '../ui-kit/FormInput';
import { QuickActionButton } from '../ui-kit/QuickActionButton';
import { Contact } from '../../types';

interface ContactPageProps {
    title?: string;
    className?: string;
}

interface ContactDetailModalProps {
    contact: Contact | null;
    onClose: () => void;
}

/**
 * Contact Detail Modal with comprehensive contact information
 */
const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, onClose }) => {
    if (!contact) return null;

    const getInfluenceColor = (level?: string) => {
        switch (level) {
            case 'high': return 'bg-error-100 text-error-700';
            case 'medium': return 'bg-warning-100 text-warning-700';
            case 'low': return 'bg-success-100 text-success-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <Avatar
                            src={contact.avatar}
                            fallback={<UserIcon className="h-6 w-6" />}
                            size="lg"
                        />
                        <div>
                            <Typography variant="h5" className="text-secondary-800">
                                {contact.first_name} {contact.last_name}
                            </Typography>
                            <Typography variant="body2" className="text-secondary-600">
                                {contact.title} at {contact.company?.name}
                            </Typography>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-2"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <Typography variant="h6" className="flex items-center space-x-2">
                                    <UserIcon className="h-5 w-5" />
                                    <span>Contact Information</span>
                                </Typography>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Typography variant="caption" className="text-gray-500">Email</Typography>
                                        <Typography variant="body2">{contact.email}</Typography>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <PhoneIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Typography variant="caption" className="text-gray-500">Phone</Typography>
                                        <Typography variant="body2">{contact.phone_number1 || 'N/A'}</Typography>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <Typography variant="caption" className="text-gray-500">Role</Typography>
                                        <Typography variant="body2">{contact.title}</Typography>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Typography variant="h6" className="flex items-center space-x-2">
                                    <ChartBarIcon className="h-5 w-5" />
                                    <span>Influence & Decision Power</span>
                                </Typography>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Typography variant="caption" className="text-gray-500">Influence Level</Typography>
                                    <div className="mt-1">
                                        <Chip
                                            label={contact.influence_level || 'Unknown'}
                                            size="sm"
                                            className={getInfluenceColor(contact.influence_level)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Typography variant="caption" className="text-gray-500">Decision Role</Typography>
                                    <Typography variant="body2" className="mt-1">
                                        {contact.decision_role || 'Not specified'}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" className="text-gray-500">Tags</Typography>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {contact.tags?.map((tag, index) => (
                                            <Chip key={index} label={tag} size="sm" className="bg-primary-100 text-primary-700" />
                                        )) || <Typography variant="body2" className="text-gray-500">No tags</Typography>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Interactions Timeline */}
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" className="flex items-center space-x-2">
                                <CalendarDaysIcon className="h-5 w-5" />
                                <span>Recent Interactions</span>
                            </Typography>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <Typography variant="body2" className="text-gray-500">
                                    Interaction timeline will be displayed here
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Opportunities */}
                    <Card>
                        <CardHeader>
                            <Typography variant="h6" className="flex items-center space-x-2">
                                <BriefcaseIcon className="h-5 w-5" />
                                <span>Active Opportunities</span>
                            </Typography>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <Typography variant="body2" className="text-gray-500">
                                    Active opportunities will be displayed here
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        <QuickActionButton
                            label="Call"
                            icon={<PhoneIcon className="h-4 w-4" />}
                            onClick={() => window.open(`tel:${contact.phone_number1}`)}
                            variant="primary"
                            size="sm"
                        />
                        <QuickActionButton
                            label="Email"
                            icon={<EnvelopeIcon className="h-4 w-4" />}
                            onClick={() => window.open(`mailto:${contact.email}`)}
                            variant="secondary"
                            size="sm"
                        />
                        <QuickActionButton
                            label="Add Interaction"
                            icon={<CalendarDaysIcon className="h-4 w-4" />}
                            onClick={() => console.log('Add interaction')}
                            variant="outline"
                            size="sm"
                        />
                        <QuickActionButton
                            label="Edit Contact"
                            icon={<UserIcon className="h-4 w-4" />}
                            onClick={() => console.log('Edit contact')}
                            variant="outline"
                            size="sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Contact Page with enhanced data table and detail modal
 */
export const ContactPage: React.FC<ContactPageProps> = ({
    title = 'Contacts',
    className
}) => {
    const resource = useResourceContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterConfig>({});
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'last_name',
        direction: 'asc'
    });
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    // Use react-admin's data fetching
    const { data, total, isLoading } = useList<Contact>(resource || 'contacts', {
        pagination: { page: 1, perPage: 50 },
        sort: { field: sortConfig.key, order: sortConfig.direction.toUpperCase() },
        filter: {
            q: searchQuery || undefined,
            ...filters
        }
    });

    // Define table columns
    const columns: Column<Contact>[] = useMemo(() => [
        {
            key: 'name',
            label: 'Contact',
            sortable: true,
            render: (_, contact) => (
                <div className="flex items-center space-x-3">
                    <Avatar
                        src={contact.avatar}
                        fallback={<UserIcon className="h-4 w-4" />}
                        size="sm"
                    />
                    <div>
                        <Typography variant="subtitle2" className="font-medium">
                            {contact.first_name} {contact.last_name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                            {contact.title}
                        </Typography>
                    </div>
                </div>
            ),
            width: '250px'
        },
        {
            key: 'company',
            label: 'Organization',
            sortable: true,
            render: (_, contact) => (
                <div>
                    <Typography variant="body2">{contact.company?.name || 'N/A'}</Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {contact.company?.business_type}
                    </Typography>
                </div>
            ),
            width: '200px'
        },
        {
            key: 'email',
            label: 'Contact Info',
            render: (_, contact) => (
                <div>
                    <Typography variant="body2">{contact.email}</Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {contact.phone_number1}
                    </Typography>
                </div>
            ),
            width: '220px'
        },
        {
            key: 'influence_level',
            label: 'Influence',
            sortable: true,
            render: (value) => value ? (
                <Chip
                    label={value}
                    size="sm"
                    className={`
                        ${value === 'high' ? 'bg-error-100 text-error-700' : ''}
                        ${value === 'medium' ? 'bg-warning-100 text-warning-700' : ''}
                        ${value === 'low' ? 'bg-success-100 text-success-700' : ''}
                    `}
                />
            ) : null,
            width: '120px'
        },
        {
            key: 'decision_role',
            label: 'Decision Role',
            render: (value) => (
                <Typography variant="body2" className="truncate">
                    {value || 'N/A'}
                </Typography>
            ),
            width: '150px'
        },
        {
            key: 'tags',
            label: 'Tags',
            render: (_, contact) => (
                <div className="flex flex-wrap gap-1">
                    {contact.tags?.slice(0, 2).map((tag, index) => (
                        <Chip key={index} label={tag} size="sm" className="bg-primary-100 text-primary-700" />
                    ))}
                    {(contact.tags?.length || 0) > 2 && (
                        <Chip label={`+${(contact.tags?.length || 0) - 2}`} size="sm" className="bg-gray-100 text-gray-600" />
                    )}
                </div>
            ),
            width: '180px'
        }
    ], []);

    // Handle data export
    const handleExport = (exportData: Contact[]) => {
        const csvContent = [
            // Header
            ['First Name', 'Last Name', 'Email', 'Phone', 'Title', 'Company', 'Influence Level', 'Decision Role'].join(','),
            // Data rows
            ...exportData.map(contact => [
                contact.first_name,
                contact.last_name,
                contact.email,
                contact.phone_number1 || '',
                contact.title || '',
                contact.company?.name || '',
                contact.influence_level || '',
                contact.decision_role || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Row actions
    const rowActions = [
        {
            label: 'View Details',
            icon: <UserIcon className="h-4 w-4" />,
            onClick: (contact: Contact) => setSelectedContact(contact)
        },
        {
            label: 'Call',
            icon: <PhoneIcon className="h-4 w-4" />,
            onClick: (contact: Contact) => {
                if (contact.phone_number1) {
                    window.open(`tel:${contact.phone_number1}`);
                }
            },
            disabled: (contact: Contact) => !contact.phone_number1
        },
        {
            label: 'Email',
            icon: <EnvelopeIcon className="h-4 w-4" />,
            onClick: (contact: Contact) => window.open(`mailto:${contact.email}`)
        }
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <UserIcon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Build and maintain relationships with key decision makers
                                </Typography>
                            </div>
                        </div>
                        
                        <QuickActionButton
                            label="Add Contact"
                            icon={<PlusIcon className="h-4 w-4" />}
                            onClick={() => console.log('Add contact')}
                            variant="primary"
                            size="sm"
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Search and Filters */}
            <Card>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <FormInput
                                label="Search contacts"
                                placeholder="Search by name, email, or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                prefixIcon={<UserIcon className="h-4 w-4" />}
                                size="sm"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => setFilters({ influence_level: 'high' })}
                                className={filters.influence_level === 'high' ? 'bg-primary-50 border-primary-200' : ''}
                            >
                                High Influence
                            </Button>
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => setFilters({})}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <DataTable
                data={data || []}
                columns={columns}
                loading={isLoading}
                sorting={{
                    enabled: true,
                    defaultSort: sortConfig,
                    onSortChange: setSortConfig
                }}
                filtering={{
                    enabled: true,
                    onFilterChange: setFilters
                }}
                actions={rowActions}
                exportable={true}
                onExport={handleExport}
                onRowClick={(contact) => setSelectedContact(contact)}
                emptyState={
                    <div className="text-center py-12">
                        <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Typography variant="h6" className="text-gray-500 mb-2">
                            No contacts found
                        </Typography>
                        <Typography variant="body2" className="text-gray-400 mb-4">
                            Start building relationships by adding your first contact
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => console.log('Add first contact')}
                            startIcon={<PlusIcon className="h-4 w-4" />}
                        >
                            Add Contact
                        </Button>
                    </div>
                }
                className="bg-white shadow-sm"
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-primary-600 font-bold">
                            {total || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Total Contacts
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-error-600 font-bold">
                            {data?.filter(contact => contact.influence_level === 'high').length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            High Influence
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-warning-600 font-bold">
                            {data?.filter(contact => contact.decision_role?.toLowerCase().includes('decision')).length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Decision Makers
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-accent-600 font-bold">
                            {data?.filter(contact => contact.tags && contact.tags.length > 0).length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Tagged Contacts
                        </Typography>
                    </CardContent>
                </Card>
            </div>

            {/* Contact Detail Modal */}
            <ContactDetailModal
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
            />
        </div>
    );
};

export default ContactPage;