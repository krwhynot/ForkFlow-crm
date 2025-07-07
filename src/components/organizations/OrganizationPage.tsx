import React, { useState, useMemo } from 'react';
import { useList, useResourceContext } from 'react-admin';
import {
    BuildingOffice2Icon,
    PlusIcon,
    FunnelIcon,
    Squares2X2Icon,
    TableCellsIcon,
    MapIcon,
    ArrowDownTrayIcon,
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

import { Organization } from '../../types';
import { AdvancedOrganizationFilter } from '../../organizations/list/AdvancedOrganizationFilter';

interface OrganizationPageProps {
    title?: string;
    className?: string;
}

type ViewMode = 'table' | 'cards' | 'map';

/**
 * Comprehensive Organization Page with enhanced data table, filtering, and multiple view modes
 * Integrates the new reusable components while maintaining existing functionality
 */
export const OrganizationPage: React.FC<OrganizationPageProps> = ({
    title = 'Organizations',
    className
}) => {
    const resource = useResourceContext();
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterConfig>({});
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'name',
        direction: 'asc'
    });
    
    // Use react-admin's data fetching with filtering
    const { data, total, isLoading, refetch } = useList<Organization>(resource || 'organizations', {
        pagination: { page: 1, perPage: 25 },
        sort: { field: sortConfig.key, order: sortConfig.direction.toUpperCase() },
        filter: {
            q: searchQuery || undefined,
            ...filters
        }
    });

    // Define table columns for the new DataTable component
    const columns: Column<Organization>[] = useMemo(() => [
        {
            key: 'name',
            label: 'Organization',
            sortable: true,
            render: (_, org) => (
                <div className="flex items-center space-x-3">
                    <Avatar
                        src={org.logo}
                        fallback={<BuildingOffice2Icon className="h-5 w-5" />}
                        size="sm"
                    />
                    <div>
                        <Typography variant="subtitle2" className="font-medium">
                            {org.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                            {org.city && org.stateAbbr && `${org.city}, ${org.stateAbbr}`}
                        </Typography>
                    </div>
                </div>
            ),
            width: '250px'
        },
        {
            key: 'business_type',
            label: 'Type',
            sortable: true,
            render: (value) => (
                <Chip 
                    label={value || 'Other'} 
                    size="sm"
                    className={`
                        ${value === 'restaurant' ? 'bg-warm-100 text-warm-700' : ''}
                        ${value === 'grocery' ? 'bg-primary-100 text-primary-700' : ''}
                        ${value === 'distributor' ? 'bg-secondary-100 text-secondary-700' : ''}
                    `}
                />
            ),
            width: '140px'
        },
        {
            key: 'contact_person',
            label: 'Contact',
            render: (_, org) => (
                <div>
                    <Typography variant="body2">{org.contact_person || 'N/A'}</Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {org.email}
                    </Typography>
                </div>
            ),
            width: '200px'
        },
        {
            key: 'revenue',
            label: 'Revenue',
            sortable: true,
            render: (value) => (
                <Typography variant="body2" className="font-medium">
                    {value ? new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact'
                    }).format(value) : 'N/A'}
                </Typography>
            ),
            align: 'right',
            width: '120px'
        },
        {
            key: 'nb_contacts',
            label: 'Contacts',
            sortable: true,
            render: (value) => (
                <Typography variant="body2">{value || 0}</Typography>
            ),
            align: 'center',
            width: '80px'
        },
        {
            key: 'nb_deals',
            label: 'Deals',
            sortable: true,
            render: (value) => (
                <Typography variant="body2">{value || 0}</Typography>
            ),
            align: 'center',
            width: '80px'
        },
        {
            key: 'priority',
            label: 'Priority',
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
            width: '100px'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (value) => value ? (
                <Chip
                    label={value}
                    size="sm"
                    className={`status-${value}`}
                />
            ) : null,
            width: '100px'
        }
    ], []);

    // Handle data export
    const handleExport = (exportData: Organization[]) => {
        const csvContent = [
            // Header
            ['Name', 'Type', 'Contact', 'Email', 'Revenue', 'Priority', 'Status', 'City', 'State'].join(','),
            // Data rows
            ...exportData.map(org => [
                org.name,
                org.business_type || '',
                org.contact_person || '',
                org.email || '',
                org.revenue || '',
                org.priority || '',
                org.status || '',
                org.city || '',
                org.stateAbbr || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Row actions
    const rowActions = [
        {
            label: 'View Details',
            icon: <BuildingOffice2Icon className="h-4 w-4" />,
            onClick: (org: Organization) => {
                // Navigate to organization detail
                console.log('View organization:', org.id);
            }
        },
        {
            label: 'Edit',
            icon: <PlusIcon className="h-4 w-4" />,
            onClick: (org: Organization) => {
                // Navigate to edit form
                console.log('Edit organization:', org.id);
            }
        }
    ];

    // View mode toggle buttons
    const viewModeButtons = [
        { mode: 'table' as ViewMode, icon: TableCellsIcon, label: 'Table View' },
        { mode: 'cards' as ViewMode, icon: Squares2X2Icon, label: 'Card View' },
        { mode: 'map' as ViewMode, icon: MapIcon, label: 'Map View' }
    ];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Page Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BuildingOffice2Icon className="h-8 w-8 text-primary-500" />
                            <div>
                                <Typography variant="h4" className="text-secondary-800">
                                    {title}
                                </Typography>
                                <Typography variant="body2" className="text-secondary-600">
                                    Manage your organization relationships and track business opportunities
                                </Typography>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                {viewModeButtons.map(({ mode, icon: Icon, label }) => (
                                    <Button
                                        key={mode}
                                        variant={viewMode === mode ? 'contained' : 'outlined'}
                                        size="sm"
                                        onClick={() => setViewMode(mode)}
                                        className={`
                                            border-0 rounded-none px-3 py-2
                                            ${viewMode === mode ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}
                                        `}
                                        aria-label={label}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </Button>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <QuickActionButton
                                label="Add Organization"
                                icon={<PlusIcon className="h-4 w-4" />}
                                onClick={() => console.log('Add organization')}
                                variant="primary"
                                size="sm"
                            />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Filters */}
            <AdvancedOrganizationFilter />

            {/* Data Table */}
            {viewMode === 'table' && (
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
                    onRowClick={(org) => console.log('Row clicked:', org.id)}
                    emptyState={
                        <div className="text-center py-12">
                            <BuildingOffice2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <Typography variant="h6" className="text-gray-500 mb-2">
                                No organizations found
                            </Typography>
                            <Typography variant="body2" className="text-gray-400 mb-4">
                                Get started by adding your first organization
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => console.log('Add first organization')}
                                startIcon={<PlusIcon className="h-4 w-4" />}
                            >
                                Add Organization
                            </Button>
                        </div>
                    }
                    className="bg-white shadow-sm"
                />
            )}

            {/* Cards View Placeholder */}
            {viewMode === 'cards' && (
                <Card>
                    <CardContent className="text-center py-12">
                        <Squares2X2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Typography variant="h6" className="text-gray-500 mb-2">
                            Card View
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Card view implementation coming soon
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Map View Placeholder */}
            {viewMode === 'map' && (
                <Card>
                    <CardContent className="text-center py-12">
                        <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <Typography variant="h6" className="text-gray-500 mb-2">
                            Map View
                        </Typography>
                        <Typography variant="body2" className="text-gray-400">
                            Geographic view implementation coming soon
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-primary-600 font-bold">
                            {total || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Total Organizations
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-warm-600 font-bold">
                            {data?.filter(org => org.priority === 'high').length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            High Priority
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-success-600 font-bold">
                            {data?.filter(org => org.status === 'active').length || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Active
                        </Typography>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="text-center py-4">
                        <Typography variant="h3" className="text-accent-600 font-bold">
                            {data?.reduce((sum, org) => sum + (org.nb_deals || 0), 0) || 0}
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                            Total Deals
                        </Typography>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OrganizationPage;