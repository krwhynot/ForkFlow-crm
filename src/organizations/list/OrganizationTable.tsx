import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Paper,
    Avatar,
    Chip,
    IconButton,
    Box,
    Typography,
} from '../../components/ui-kit';
import {
    PencilSquareIcon as EditIcon,
    EyeIcon as ViewIcon,
    BuildingOffice2Icon as BusinessIcon,
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
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading organizations...</Typography>
            </Box>
        );
    }

    if (organizations.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No organizations found
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table stickyHeader aria-label="organizations table">
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={viewMode.sortField === 'name'}
                                direction={
                                    viewMode.sortOrder.toLowerCase() as
                                        | 'asc'
                                        | 'desc'
                                }
                                onClick={() => handleSort('name')}
                            >
                                Organization
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={viewMode.sortField === 'business_type'}
                                direction={
                                    viewMode.sortOrder.toLowerCase() as
                                        | 'asc'
                                        | 'desc'
                                }
                                onClick={() => handleSort('business_type')}
                            >
                                Type
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Contact</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={viewMode.sortField === 'revenue'}
                                direction={
                                    viewMode.sortOrder.toLowerCase() as
                                        | 'asc'
                                        | 'desc'
                                }
                                onClick={() => handleSort('revenue')}
                            >
                                Revenue
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={viewMode.sortField === 'nb_contacts'}
                                direction={
                                    viewMode.sortOrder.toLowerCase() as
                                        | 'asc'
                                        | 'desc'
                                }
                                onClick={() => handleSort('nb_contacts')}
                            >
                                Contacts
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={viewMode.sortField === 'nb_deals'}
                                direction={
                                    viewMode.sortOrder.toLowerCase() as
                                        | 'asc'
                                        | 'desc'
                                }
                                onClick={() => handleSort('nb_deals')}
                            >
                                Deals
                            </TableSortLabel>
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
                            sx={{
                                '&:last-child td, &:last-child th': {
                                    border: 0,
                                },
                                cursor: 'pointer',
                            }}
                        >
                            <TableCell>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Avatar
                                        src={org.logo}
                                        sx={{ width: 40, height: 40 }}
                                    >
                                        <BusinessIcon />
                                    </Avatar>
                                    <Box>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight="medium"
                                        >
                                            {org.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
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
                                        color="text.secondary"
                                    >
                                        {org.email}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" fontWeight="medium">
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
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                        size="small"
                                        aria-label={`View ${org.name}`}
                                        sx={{
                                            minHeight: '32px',
                                            minWidth: '32px',
                                        }}
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        aria-label={`Edit ${org.name}`}
                                        sx={{
                                            minHeight: '32px',
                                            minWidth: '32px',
                                        }}
                                    >
                                        <EditIcon />
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
