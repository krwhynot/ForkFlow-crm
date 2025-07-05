import React, { forwardRef, useMemo, useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import {
    Box,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    LinearProgress,
    Chip,
    Avatar,
    IconButton,
} from '@/components/ui-kit';
import {
    PencilIcon as EditIcon,
    EyeIcon as ViewIcon,
    BuildingOfficeIcon as BusinessIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { Organization, OrganizationListViewMode } from '../../types';
import { useInfiniteOrganizations } from '../hooks/useInfiniteOrganizations';
import { useBreakpoint } from '../../hooks/useBreakpoint';

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

    // Table header component
    const TableHeader = useMemo(
        () => (
            <TableHead>
                <TableRow>
                    <TableCell className="min-w-[200px]">
                        <SortLabel
                            field="name"
                            active={viewMode.sortField === 'name'}
                            direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                            onClick={() => handleSort('name')}
                        >
                            Organization
                        </SortLabel>
                    </TableCell>
                    {!isMobile && (
                        <>
                            <TableCell className="min-w-[120px]">
                                <SortLabel
                                    field="business_type"
                                    active={viewMode.sortField === 'business_type'}
                                    direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                    onClick={() => handleSort('business_type')}
                                >
                                    Type
                                </SortLabel>
                            </TableCell>
                            <TableCell className="min-w-[150px]">
                                Contact
                            </TableCell>
                            <TableCell className="min-w-[100px]">
                                <SortLabel
                                    field="revenue"
                                    active={viewMode.sortField === 'revenue'}
                                    direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                    onClick={() => handleSort('revenue')}
                                >
                                    Revenue
                                </SortLabel>
                            </TableCell>
                            <TableCell className="min-w-[80px]">
                                <SortLabel
                                    field="nb_contacts"
                                    active={viewMode.sortField === 'nb_contacts'}
                                    direction={viewMode.sortOrder.toLowerCase() as 'asc' | 'desc'}
                                    onClick={() => handleSort('nb_contacts')}
                                >
                                    Contacts
                                </SortLabel>
                            </TableCell>
                            <TableCell className="min-w-[80px]">
                                Priority
                            </TableCell>
                            <TableCell className="min-w-[80px]">Status</TableCell>
                        </>
                    )}
                    <TableCell align="right" className="min-w-[100px]">
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
                            className="flex items-center px-4 border-b border-gray-200"
                            style={{ height: itemHeight }}
                        >
                            <Typography variant="body2" className="text-gray-500">
                                Loading...
                            </Typography>
                        </Box>
                    </div>
                );
            }

            return (
                <div ref={ref} style={style}>
                    <Box
                        className="flex items-center px-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        style={{ height: itemHeight }}
                    >
                        {/* Organization Info */}
                        <Box
                            className={`flex items-center gap-4 min-w-[200px] ${
                                isMobile ? 'flex-1' : ''
                            }`}
                        >
                            <Avatar
                                src={org.logo}
                                className="w-10 h-10"
                            >
                                <BusinessIcon className="w-5 h-5" />
                            </Avatar>
                            <Box className="min-w-0">
                                <Typography
                                    variant="subtitle2"
                                    className="font-medium overflow-hidden text-ellipsis whitespace-nowrap"
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

                        {/* Desktop columns */}
                        {!isMobile && (
                            <>
                                {/* Business Type */}
                                <Box className="min-w-[120px]">
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
                                <Box className="min-w-[150px]">
                                    <Typography
                                        variant="body2"
                                        className="mb-1"
                                    >
                                        {org.contact_person || 'N/A'}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        className="text-gray-500"
                                    >
                                        {org.email}
                                    </Typography>
                                </Box>

                                {/* Revenue */}
                                <Box className="min-w-[100px]">
                                    <Typography
                                        variant="body2"
                                        className="font-medium"
                                    >
                                        {formatRevenue(org.revenue)}
                                    </Typography>
                                </Box>

                                {/* Contacts Count */}
                                <Box className="min-w-[80px]">
                                    <Typography variant="body2">
                                        {org.nb_contacts || 0}
                                    </Typography>
                                </Box>

                                {/* Priority */}
                                <Box className="min-w-[80px]">
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
                                <Box className="min-w-[80px]">
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
                        <Box className="flex gap-1 ml-auto min-w-[100px] justify-end">
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
                    </Box>
                </div>
            );
        }
    );

    Row.displayName = 'VirtualizedTableRow';

    // Loading and empty states
    if (isPending && organizations.length === 0) {
        return (
            <Box className="p-6 text-center">
                <Typography>Loading organizations...</Typography>
                <LinearProgress className="mt-4" />
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

    const itemCount = hasNextPage
        ? organizations.length + 1
        : organizations.length;

    return (
        <Box className="w-full">
            {/* Progress indicator */}
            <Box className="mb-2 flex items-center gap-4">
                <Typography variant="body2" className="text-gray-500">
                    {metrics.loadedItems} of {metrics.totalItems} organizations
                </Typography>
                <Box className="flex-grow max-w-[200px]">
                    <LinearProgress
                        variant="determinate"
                        value={metrics.loadingProgress}
                        className="h-1 rounded"
                    />
                </Box>
                {isFetchingNextPage && (
                    <Typography variant="caption" className="text-blue-600">
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
