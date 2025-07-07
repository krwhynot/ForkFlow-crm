import {
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../typography/Typography';

export interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    sorting?: {
        enabled: boolean;
        defaultSort?: SortConfig;
        onSortChange?: (sort: SortConfig) => void;
    };
    onRowClick?: (row: T, index: number) => void;
    emptyState?: React.ReactNode;
    className?: string;
    tableClassName?: string;
    rowClassName?: (row: T, index: number) => string;
}

/**
 * Simplified data table component for displaying tabular data
 * Provides sorting, click handling, and loading states
 */
export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    loading = false,
    sorting,
    onRowClick,
    emptyState,
    className,
    tableClassName,
    rowClassName,
}: DataTableProps<T>) {
    const [currentSort, setCurrentSort] = useState<SortConfig | null>(
        sorting?.defaultSort || null
    );

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

    // Sort data
    const sortedData = useMemo(() => {
        if (!currentSort) return data;

        return [...data].sort((a, b) => {
            const aValue = a[currentSort.key];
            const bValue = b[currentSort.key];

            if (aValue < bValue) return currentSort.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, currentSort]);

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
                <>
                    <div className="h-12 w-12 text-gray-300 mx-auto mb-4">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <Typography variant="h6" className="text-gray-500 mb-2">
                        No data available
                    </Typography>
                    <Typography variant="body2" className="text-gray-400">
                        There are no items to display at this time.
                    </Typography>
                </>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className={twMerge('bg-white rounded-lg border shadow-sm', className)}>
                <LoadingSkeleton />
            </div>
        );
    }

    if (!sortedData.length) {
        return (
            <div className={twMerge('bg-white rounded-lg border shadow-sm', className)}>
                <EmptyState />
            </div>
        );
    }

    return (
        <div className={twMerge('bg-white rounded-lg border shadow-sm overflow-hidden', className)}>
            <div className="overflow-x-auto">
                <table className={twMerge('w-full', tableClassName)}>
                    {/* Header */}
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={twMerge(
                                        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                        column.sortable && sorting?.enabled && 'cursor-pointer hover:bg-gray-100',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.className
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{column.label}</span>
                                        {column.sortable && sorting?.enabled && (
                                            <div className="flex flex-col">
                                                <ChevronUpIcon
                                                    className={twMerge(
                                                        'h-3 w-3',
                                                        currentSort?.key === column.key && currentSort.direction === 'asc'
                                                            ? 'text-blue-600'
                                                            : 'text-gray-400'
                                                    )}
                                                />
                                                <ChevronDownIcon
                                                    className={twMerge(
                                                        'h-3 w-3 -mt-1',
                                                        currentSort?.key === column.key && currentSort.direction === 'desc'
                                                            ? 'text-blue-600'
                                                            : 'text-gray-400'
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={twMerge(
                                    'hover:bg-gray-50 transition-colors',
                                    onRowClick && 'cursor-pointer',
                                    rowClassName?.(row, rowIndex)
                                )}
                                onClick={() => onRowClick?.(row, rowIndex)}
                            >
                                {columns.map((column, colIndex) => {
                                    const value = row[column.key];
                                    const cellContent = column.render
                                        ? column.render(value, row, rowIndex)
                                        : value;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={twMerge(
                                                'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                                                column.align === 'center' && 'text-center',
                                                column.align === 'right' && 'text-right'
                                            )}
                                        >
                                            {cellContent}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 