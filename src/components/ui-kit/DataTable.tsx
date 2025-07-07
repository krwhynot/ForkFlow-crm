import React, { useState, useMemo } from 'react';
import {
    ChevronUpIcon,
    ChevronDownIcon,
    EllipsisVerticalIcon,
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Typography } from './Typography';
import { Button } from './Button';
import { Input } from './Input';
import { Dropdown, DropdownItem } from './Dropdown';
import { Checkbox } from './Checkbox';
import { Chip } from './Chip';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface FilterConfig {
    [key: string]: any;
}

export interface PaginationConfig {
    page: number;
    pageSize: number;
    total: number;
    showSizeOptions?: boolean;
    sizeOptions?: number[];
}

export interface SelectionConfig {
    enabled: boolean;
    mode?: 'single' | 'multiple';
    selectedRows?: string[];
    onSelectionChange?: (selectedRows: string[]) => void;
    getRowId?: (row: any) => string;
}

export interface RowAction<T> {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    disabled?: (row: T) => boolean;
    hidden?: (row: T) => boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    pagination?: PaginationConfig;
    sorting?: {
        enabled: boolean;
        defaultSort?: SortConfig;
        onSortChange?: (sort: SortConfig) => void;
    };
    filtering?: {
        enabled: boolean;
        onFilterChange?: (filters: FilterConfig) => void;
    };
    selection?: SelectionConfig;
    actions?: RowAction<T>[];
    onRowClick?: (row: T, index: number) => void;
    emptyState?: React.ReactNode;
    exportable?: boolean;
    onExport?: (data: T[]) => void;
    className?: string;
    tableClassName?: string;
    rowClassName?: (row: T, index: number) => string;
}

/**
 * Comprehensive data table component with sorting, filtering, pagination, and more
 * Designed to replace patterns from OrganizationTable and similar components
 */
export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    pagination,
    sorting,
    filtering,
    selection,
    actions,
    onRowClick,
    emptyState,
    exportable = false,
    onExport,
    className,
    tableClassName,
    rowClassName,
}: DataTableProps<T>) {
    const [currentSort, setCurrentSort] = useState<SortConfig | null>(
        sorting?.defaultSort || null
    );
    const [filters, setFilters] = useState<FilterConfig>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Handle sorting
    const handleSort = (key: string) => {
        if (!sorting?.enabled) return;

        const newSort: SortConfig = {
            key,
            direction: currentSort?.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc'
        };

        setCurrentSort(newSort);
        sorting.onSortChange?.(newSort);
    };

    // Filter and sort data
    const processedData = useMemo(() => {
        let result = [...data];

        // Apply search filter
        if (searchQuery && filtering?.enabled) {
            result = result.filter(row =>
                Object.values(row).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        // Apply column filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(row => {
                    const rowValue = String(row[key]).toLowerCase();
                    const filterValue = String(value).toLowerCase();
                    return rowValue.includes(filterValue);
                });
            }
        });

        // Apply sorting
        if (currentSort) {
            result.sort((a, b) => {
                const aValue = a[currentSort.key];
                const bValue = b[currentSort.key];
                
                if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchQuery, filters, currentSort, filtering?.enabled]);

    // Handle selection
    const handleRowSelection = (rowId: string, checked: boolean) => {
        if (!selection?.enabled || !selection.onSelectionChange) return;

        const currentSelection = selection.selectedRows || [];
        
        if (selection.mode === 'single') {
            selection.onSelectionChange(checked ? [rowId] : []);
        } else {
            const newSelection = checked
                ? [...currentSelection, rowId]
                : currentSelection.filter(id => id !== rowId);
            selection.onSelectionChange(newSelection);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (!selection?.enabled || !selection.onSelectionChange) return;

        if (checked) {
            const allIds = processedData.map(row => 
                selection.getRowId ? selection.getRowId(row) : String(row.id)
            );
            selection.onSelectionChange(allIds);
        } else {
            selection.onSelectionChange([]);
        }
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex space-x-4 py-4 border-b border-gray-200">
                    {columns.map((column, colIndex) => (
                        <div key={colIndex} className="flex-1">
                            <div className="h-4 bg-gray-200 rounded" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );

    // Empty state
    const EmptyState = () => (
        <div className="text-center py-12">
            {emptyState || (
                <div>
                    <Typography variant="h6" className="text-gray-500 mb-2">
                        No data available
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        There are no items to display at this time.
                    </Typography>
                </div>
            )}
        </div>
    );

    const isAllSelected = selection?.enabled && selection.selectedRows &&
        processedData.length > 0 &&
        processedData.every(row => {
            const rowId = selection.getRowId ? selection.getRowId(row) : String(row.id);
            return selection.selectedRows!.includes(rowId);
        });

    const isSomeSelected = selection?.enabled && selection.selectedRows &&
        selection.selectedRows.length > 0 && !isAllSelected;

    return (
        <div className={cn('bg-white rounded-lg border shadow-sm', className)}>
            {/* Table Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Search */}
                    {filtering?.enabled && (
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                prefixIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                                size="sm"
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {selection?.enabled && selection.selectedRows && selection.selectedRows.length > 0 && (
                            <Chip
                                label={`${selection.selectedRows.length} selected`}
                                size="small"
                                className="bg-blue-100 text-blue-800"
                            />
                        )}
                        
                        {exportable && (
                            <Button
                                variant="outlined"
                                size="sm"
                                onClick={() => onExport?.(processedData)}
                                startIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                            >
                                Export
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className={cn('w-full', tableClassName)}>
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Selection column */}
                            {selection?.enabled && selection.mode === 'multiple' && (
                                <th className="w-12 px-4 py-3">
                                    <Checkbox
                                        checked={isAllSelected}
                                        indeterminate={isSomeSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                            )}

                            {/* Data columns */}
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={cn(
                                        'px-4 py-3 text-left',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.className
                                    )}
                                    style={{ width: column.width }}
                                >
                                    {column.sortable && sorting?.enabled ? (
                                        <button
                                            onClick={() => handleSort(String(column.key))}
                                            className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                                        >
                                            <span>{column.label}</span>
                                            {currentSort?.key === column.key && (
                                                currentSort.direction === 'asc' 
                                                    ? <ChevronUpIcon className="h-4 w-4" />
                                                    : <ChevronDownIcon className="h-4 w-4" />
                                            )}
                                        </button>
                                    ) : (
                                        <Typography variant="caption" className="font-medium text-gray-500 uppercase tracking-wider">
                                            {column.label}
                                        </Typography>
                                    )}
                                </th>
                            ))}

                            {/* Actions column */}
                            {actions && actions.length > 0 && (
                                <th className="w-12 px-4 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (selection?.enabled ? 1 : 0) + (actions ? 1 : 0)}>
                                    <LoadingSkeleton />
                                </td>
                            </tr>
                        ) : processedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (selection?.enabled ? 1 : 0) + (actions ? 1 : 0)}>
                                    <EmptyState />
                                </td>
                            </tr>
                        ) : (
                            processedData.map((row, index) => {
                                const rowId = selection?.getRowId ? selection.getRowId(row) : String(row.id);
                                const isSelected = selection?.selectedRows?.includes(rowId) || false;

                                return (
                                    <tr
                                        key={rowId}
                                        onClick={() => onRowClick?.(row, index)}
                                        className={cn(
                                            'hover:bg-gray-50 transition-colors',
                                            onRowClick && 'cursor-pointer',
                                            isSelected && 'bg-blue-50',
                                            rowClassName?.(row, index)
                                        )}
                                    >
                                        {/* Selection cell */}
                                        {selection?.enabled && (
                                            <td className="px-4 py-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleRowSelection(rowId, e.target.checked)}
                                                />
                                            </td>
                                        )}

                                        {/* Data cells */}
                                        {columns.map((column) => (
                                            <td
                                                key={String(column.key)}
                                                className={cn(
                                                    'px-4 py-3',
                                                    column.align === 'center' && 'text-center',
                                                    column.align === 'right' && 'text-right',
                                                    column.className
                                                )}
                                            >
                                                {column.render 
                                                    ? column.render(row[column.key as keyof T], row, index)
                                                    : String(row[column.key as keyof T] || '')
                                                }
                                            </td>
                                        ))}

                                        {/* Actions cell */}
                                        {actions && actions.length > 0 && (
                                            <td className="px-4 py-3">
                                                <Dropdown
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-1"
                                                        >
                                                            <EllipsisVerticalIcon className="h-4 w-4" />
                                                        </Button>
                                                    }
                                                >
                                                    {actions
                                                        .filter(action => !action.hidden?.(row))
                                                        .map((action, actionIndex) => (
                                                            <DropdownItem
                                                                key={actionIndex}
                                                                onClick={() => action.onClick(row)}
                                                                disabled={action.disabled?.(row)}
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    {action.icon}
                                                                    <span>{action.label}</span>
                                                                </div>
                                                            </DropdownItem>
                                                        ))
                                                    }
                                                </Dropdown>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Typography variant="caption" className="text-gray-500">
                            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
                            {pagination.total} results
                        </Typography>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={pagination.page <= 1}
                            onClick={() => {/* Handle previous page */}}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outlined"
                            size="sm"
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                            onClick={() => {/* Handle next page */}}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}