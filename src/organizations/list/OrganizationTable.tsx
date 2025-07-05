import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Box,
    Typography,
} from '@/components/ui-kit';
import {
    PencilIcon as EditIcon,
    EyeIcon as ViewIcon,
    BuildingOfficeIcon as BusinessIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Organization, OrganizationListViewMode } from '../../types';

interface OrganizationTableProps {
    organizations: Organization[];
    loading?: boolean;
    viewMode: OrganizationListViewMode;
}

/**
 * Table view component for organizations with sortable columns
 * Optimized for desktop use with comprehensive data display
 */
export const OrganizationTable: React.FC<OrganizationTableProps> = ({
    organizations,
    loading = false,
    viewMode,
}) => {
    const handleSort = (field: string) => {
        // TODO: Implement sorting logic
        console.log('Sort by:', field);
    };

    // Custom sort label component
    const SortLabel = ({ field, children, active, direction, onClick }: { 
        field: string; 
        children: React.ReactNode; 
        active: boolean; 
        direction: 'asc' | 'desc'; 
        onClick: () => void 
    }) => (
        <button
            onClick={onClick}
            className="flex items-center gap-1 text-left hover:text-blue-600 transition-colors"
        >
            {children}
            {active && (
                direction === 'asc' ? (
                    <ChevronUpIcon className="w-4 h-4" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4" />
                )
            )}
        </button>
    );

    const formatRevenue = (revenue?: number) => {
        if (!revenue) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
        }).format(revenue);
    };

    const getBusinessTypeColor = (type?: string) => {
        switch (type) {
            case 'restaurant':
                return 'warning';
            case 'grocery':
                return 'success';
            case 'distributor':
                return 'secondary';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box className="p-6 text-center">
                <Typography>Loading organizations...</Typography>
            </Box>
        );
    }

    if (organizations.length === 0) {
        return (
            <Box className="p-6 text-center">
                <Typography variant="h6" className="text-gray-500">
                    No organizations found
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} className="mt-4">
            <Table stickyHeader aria-label="organizations table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <SortLabel
                                field="name"
                                active={viewMode.sortField === 'name'}
                                direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                onClick={() => handleSort('name')}
                            >
                                Organization
                            </SortLabel>
                        </TableCell>
                        <TableCell>
                            <SortLabel
                                field="business_type"
                                active={viewMode.sortField === 'business_type'}
                                direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                onClick={() => handleSort('business_type')}
                            >
                                Type
                            </SortLabel>
                        </TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>
                            <SortLabel
                                field="revenue"
                                active={viewMode.sortField === 'revenue'}
                                direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                onClick={() => handleSort('revenue')}
                            >
                                Revenue
                            </SortLabel>
                        </TableCell>
                        <TableCell>
                            <SortLabel
                                field="nb_contacts"
                                active={viewMode.sortField === 'nb_contacts'}
                                direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                onClick={() => handleSort('nb_contacts')}
                            >
                                Contacts
                            </SortLabel>
                        </TableCell>
                        <TableCell>
                            <SortLabel
                                field="nb_deals"
                                active={viewMode.sortField === 'nb_deals'}
                                direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                onClick={() => handleSort('nb_deals')}
                            >
                                Deals
                            </SortLabel>
                        </TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {organizations.map(org => (
                        <TableRow
                            key={org.id}
                            hover
                            className="cursor-pointer last:border-b-0"
                        >
                            <TableCell>
                                <Box className="flex items-center gap-4">
                                    <Avatar
                                        src={org.logo}
                                        className="w-10 h-10"
                                    >
                                        <BusinessIcon className="w-5 h-5" />
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            className="font-medium"
                                        >
                                            {org.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="text-gray-500"
                                        >
                                            {org.city &&
                                                org.stateAbbr &&
                                                `${org.city}, ${org.stateAbbr}`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={org.business_type || 'Other'}
                                    size="small"
                                    color={
                                        getBusinessTypeColor(
                                            org.business_type
                                        ) as any
                                    }
                                    variant="outlined"
                                />
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Typography variant="body2">
                                        {org.contact_person || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        {org.email}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" className="font-medium">
                                    {formatRevenue(org.revenue)}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {org.nb_contacts || 0}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">
                                    {org.nb_deals || 0}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                {org.priority && (
                                    <Chip
                                        label={org.priority}
                                        size="small"
                                        color={
                                            getPriorityColor(
                                                org.priority
                                            ) as any
                                        }
                                        variant="filled"
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {org.status && (
                                    <Chip
                                        label={org.status}
                                        size="small"
                                        className={`status-${org.status}`}
                                        variant="outlined"
                                    />
                                )}
                            </TableCell>
                            <TableCell align="right">
                                <Box className="flex gap-1">
                                    <IconButton
                                        size="small"
                                        aria-label={`View ${org.name}`}
                                        className="min-h-8 min-w-8"
                                    >
                                        <ViewIcon className="w-4 h-4" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        aria-label={`Edit ${org.name}`}
                                        className="min-h-8 min-w-8"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </IconButton>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
