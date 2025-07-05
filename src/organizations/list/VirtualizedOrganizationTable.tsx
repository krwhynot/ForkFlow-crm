import {
    Avatar,
    Box,
    Chip,
    IconButton,
    LinearProgress,
    Paper,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
} from '@/components/ui-kit';
import {
    BuildingOffice2Icon as BusinessIcon,
    PencilSquareIcon as EditIcon,
    EyeIcon as ViewIcon,
} from '@heroicons/react/24/outline';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { OrganizationListViewMode } from '../../types';
import { useInfiniteOrganizations } from '../hooks/useInfiniteOrganizations';

interface VirtualizedOrganizationTableProps {
    viewMode: OrganizationListViewMode;
    height?: number;
    itemHeight?: number;
    overscan?: number;
}

/**
 * Virtualized table component for organizations using react-window
 * Optimized for large datasets with infinite loading and 80px item height
 */
export const VirtualizedOrganizationTable: React.FC<
    VirtualizedOrganizationTableProps
> = ({ viewMode, height = 600, itemHeight = 80, overscan = 10 }) => {
    const isMobile = useBreakpoint('md');

    const {
        organizations,
        metrics,
        isPending,
        isFetchingNextPage,
        handleItemsRendered,
        hasNextPage,
    } = useInfiniteOrganizations({
        enabled: true,
        pageSize: 25,
        threshold: 10,
    });

    const handleSort = useCallback((field: string) => {
        // TODO: Implement sorting logic with useListContext
        console.log('Sort by:', field);
    }, []);

    // Check if item is loaded (for infinite loader)
    const isItemLoaded = useCallback(
        (index: number) => {
            return !!organizations[index];
        },
        [organizations]
    );

    // Load more items for infinite loader
    const loadMoreItems = useCallback(() => {
        // This is handled by the handleItemsRendered callback
        return Promise.resolve();
    }, []);

    const formatRevenue = useCallback((revenue?: number) => {
        if (!revenue) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
        }).format(revenue);
    }, []);

    const getBusinessTypeColor = useCallback((type?: string) => {
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
    }, []);

    const getPriorityColor = useCallback((priority?: string) => {
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
    }, []);

    // Table header component
    const TableHeader = useMemo(
        () => (
            <TableHead>
                <TableRow>
                    <TableCell sx={{ minWidth: 200 }}>
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
                    {!isMobile && (
                        <>
                            <TableCell sx={{ minWidth: 120 }}>
                                <TableSortLabel
                                    active={
                                        viewMode.sortField === 'business_type'
                                    }
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
                            <TableCell sx={{ minWidth: 150 }}>
                                Contact
                            </TableCell>
                            <TableCell sx={{ minWidth: 100 }}>
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
                            <TableCell sx={{ minWidth: 80 }}>
                                <TableSortLabel
                                    active={
                                        viewMode.sortField === 'nb_contacts'
                                    }
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
                            <TableCell sx={{ minWidth: 80 }}>
                                Priority
                            </TableCell>
                            <TableCell sx={{ minWidth: 80 }}>Status</TableCell>
                        </>
                    )}
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                        Actions
                    </TableCell>
                </TableRow>
            </TableHead>
        ),
        [viewMode.sortField, viewMode.sortOrder, handleSort, isMobile]
    );

    // Row component for virtual list
    const Row = forwardRef<HTMLDivElement, ListChildComponentProps>(
        ({ index, style }, ref) => {
            const org = organizations[index];

            // Show loading placeholder for unloaded items
            if (!org) {
                return (
                    <div ref={ref} style={style}>
                        <Box
                            sx={{
                                height: itemHeight,
                                display: 'flex',
                                alignItems: 'center',
                                px: 2,
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Loading...
                            </Typography>
                        </Box>
                    </div>
                );
            }

            return (
                <div ref={ref} style={style}>
                    <Box
                        sx={{
                            height: itemHeight,
                            display: 'flex',
                            alignItems: 'center',
                            px: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                            cursor: 'pointer',
                        }}
                    >
                        {/* Organization Info */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                minWidth: 200,
                                flex: isMobile ? 1 : 'none',
                            }}
                        >
                            <Avatar
                                src={org.logo}
                                sx={{ width: 40, height: 40 }}
                            >
                                <BusinessIcon />
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="medium"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
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

                        {/* Desktop columns */}
                        {!isMobile && (
                            <>
                                {/* Business Type */}
                                <Box sx={{ minWidth: 120 }}>
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
                                </Box>

                                {/* Contact */}
                                <Box sx={{ minWidth: 150 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{ mb: 0.5 }}
                                    >
                                        {org.contact_person || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {org.email}
                                    </Typography>
                                </Box>

                                {/* Revenue */}
                                <Box sx={{ minWidth: 100 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                    >
                                        {formatRevenue(org.revenue)}
                                    </Typography>
                                </Box>

                                {/* Contacts Count */}
                                <Box sx={{ minWidth: 80 }}>
                                    <Typography variant="body2">
                                        {org.nb_contacts || 0}
                                    </Typography>
                                </Box>

                                {/* Priority */}
                                <Box sx={{ minWidth: 80 }}>
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
                                </Box>

                                {/* Status */}
                                <Box sx={{ minWidth: 80 }}>
                                    {org.status && (
                                        <Chip
                                            label={org.status}
                                            size="small"
                                            className={`status-${org.status}`}
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </>
                        )}

                        {/* Actions */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 0.5,
                                ml: 'auto',
                                minWidth: 100,
                                justifyContent: 'flex-end',
                            }}
                        >
                            <IconButton
                                size="small"
                                aria-label={`View ${org.name}`}
                                sx={{ minHeight: '32px', minWidth: '32px' }}
                            >
                                <ViewIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                aria-label={`Edit ${org.name}`}
                                sx={{ minHeight: '32px', minWidth: '32px' }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </div>
            );
        }
    );

    Row.displayName = 'VirtualizedTableRow';

    // Loading and empty states
    if (isPending && organizations.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading organizations...</Typography>
                <LinearProgress sx={{ mt: 2 }} />
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

    const itemCount = hasNextPage
        ? organizations.length + 1
        : organizations.length;

    return (
        <Box sx={{ width: '100%' }}>
            {/* Progress indicator */}
            <Box
                sx={{
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {metrics.loadedItems} of {metrics.totalItems} organizations
                </Typography>
                <Box sx={{ flexGrow: 1, maxWidth: 200 }}>
                    <LinearProgress
                        variant="determinate"
                        value={metrics.loadingProgress}
                        sx={{ height: 4, borderRadius: 2 }}
                    />
                </Box>
                {isFetchingNextPage && (
                    <Typography variant="caption" color="primary">
                        Loading more...
                    </Typography>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table stickyHeader size="small">
                    {TableHeader}
                </Table>

                <InfiniteLoader
                    isItemLoaded={isItemLoaded}
                    itemCount={itemCount}
                    loadMoreItems={loadMoreItems}
                    threshold={overscan}
                >
                    {({ onItemsRendered, ref }) => (
                        <List
                            ref={ref}
                            height={height}
                            itemCount={itemCount}
                            itemSize={itemHeight}
                            onItemsRendered={props => {
                                onItemsRendered(props);
                                handleItemsRendered(props);
                            }}
                            overscanCount={overscan}
                            width="100%"
                        >
                            {Row}
                        </List>
                    )}
                </InfiniteLoader>
            </TableContainer>
        </Box>
    );
};
