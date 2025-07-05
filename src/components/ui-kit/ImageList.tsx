import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * ImageList Component
 * Replaces Material-UI ImageList with Tailwind CSS styling
 * Responsive grid layout with configurable columns
 * Mobile-friendly with touch interactions
 */

interface ImageListProps {
    cols?: number;
    gap?: number;
    children: React.ReactNode;
    className?: string;
}

interface ImageListItemProps {
    children: React.ReactNode;
    className?: string;
}

export const ImageList: React.FC<ImageListProps> = ({
    cols = 3,
    gap = 8,
    children,
    className,
}) => {
    // Convert gap to Tailwind classes
    const getGapClass = (gap: number) => {
        const gapMap: { [key: number]: string } = {
            0: 'gap-0',
            1: 'gap-1',
            2: 'gap-2',
            3: 'gap-3',
            4: 'gap-4',
            5: 'gap-5',
            6: 'gap-6',
            8: 'gap-8',
            12: 'gap-12',
            16: 'gap-16',
        };
        return gapMap[gap] || 'gap-4';
    };

    // Generate responsive grid classes
    const getGridCols = (cols: number) => {
        const colsMap: { [key: number]: string } = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
            5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
            6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
        };
        return colsMap[cols] || 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    };

    return (
        <div
            className={twMerge(
                'grid w-full',
                getGridCols(cols),
                getGapClass(gap),
                className
            )}
        >
            {children}
        </div>
    );
};

export const ImageListItem: React.FC<ImageListItemProps> = ({
    children,
    className,
}) => {
    return (
        <div
            className={twMerge(
                'relative overflow-hidden rounded-lg',
                'aspect-square', // Default square aspect ratio
                'bg-gray-100',
                'hover:scale-105 transition-transform duration-200',
                'cursor-pointer',
                'min-h-[44px] min-w-[44px]', // Touch-friendly minimum size
                className
            )}
        >
            {children}
        </div>
    );
};

export default ImageList;