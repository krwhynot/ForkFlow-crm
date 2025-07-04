/**
 * Grid Component
 * Responsive grid layout system similar to Material-UI Grid
 */

import React from 'react';
import { cn } from '../../utils/cn';

type GridSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto' | true;

interface GridProps {
    container?: boolean;
    item?: boolean;
    xs?: GridSize;
    sm?: GridSize;
    md?: GridSize;
    lg?: GridSize;
    xl?: GridSize;
    spacing?: number;
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    wrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    component?: keyof JSX.IntrinsicElements;
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

/**
 * Convert grid size to Tailwind classes
 */
const getGridSizeClass = (size: GridSize | undefined, breakpoint: string = ''): string => {
    if (!size) return '';
    
    const prefix = breakpoint ? `${breakpoint}:` : '';
    
    if (size === true || size === 'auto') {
        return `${prefix}flex-1`;
    }
    
    // Convert to fraction of 12 columns
    const fraction = size / 12;
    if (fraction === 1) return `${prefix}w-full`;
    if (fraction === 0.5) return `${prefix}w-1/2`;
    if (fraction === 1/3) return `${prefix}w-1/3`;
    if (fraction === 2/3) return `${prefix}w-2/3`;
    if (fraction === 0.25) return `${prefix}w-1/4`;
    if (fraction === 0.75) return `${prefix}w-3/4`;
    if (fraction === 1/5) return `${prefix}w-1/5`;
    if (fraction === 2/5) return `${prefix}w-2/5`;
    if (fraction === 3/5) return `${prefix}w-3/5`;
    if (fraction === 4/5) return `${prefix}w-4/5`;
    if (fraction === 1/6) return `${prefix}w-1/6`;
    if (fraction === 5/6) return `${prefix}w-5/6`;
    if (fraction === 1/12) return `${prefix}w-1/12`;
    if (fraction === 5/12) return `${prefix}w-5/12`;
    if (fraction === 7/12) return `${prefix}w-7/12`;
    if (fraction === 8/12) return `${prefix}w-8/12`;
    if (fraction === 9/12) return `${prefix}w-9/12`;
    if (fraction === 10/12) return `${prefix}w-10/12`;
    if (fraction === 11/12) return `${prefix}w-11/12`;
    
    return `${prefix}w-${size}/12`;
};

const DIRECTION_CLASSES = {
    row: 'flex-row',
    column: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'column-reverse': 'flex-col-reverse',
};

const ALIGN_ITEMS_CLASSES = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
};

const JUSTIFY_CONTENT_CLASSES = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
};

const WRAP_CLASSES = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    'wrap-reverse': 'flex-wrap-reverse',
};

/**
 * Utility function to convert spacing to gap classes
 */
const getSpacingClass = (spacing: number | undefined): string => {
    if (!spacing) return '';
    
    // Map spacing to Tailwind gap classes
    const spacingMap: Record<number, string> = {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
    };
    
    return spacingMap[spacing] || `gap-${spacing}`;
};

/**
 * Grid component for responsive layout
 */
export const Grid: React.FC<GridProps> = ({
    container = false,
    item = false,
    xs,
    sm,
    md,
    lg,
    xl,
    spacing,
    direction = 'row',
    alignItems,
    justifyContent,
    wrap = 'wrap',
    component = 'div',
    className,
    children,
    style,
}) => {
    const Component = component;

    const classes = cn(
        // Base classes
        container && 'flex',
        !container && item && 'flex-shrink-0',
        
        // Container-specific classes
        container && [
            DIRECTION_CLASSES[direction],
            alignItems && ALIGN_ITEMS_CLASSES[alignItems],
            justifyContent && JUSTIFY_CONTENT_CLASSES[justifyContent],
            WRAP_CLASSES[wrap],
            getSpacingClass(spacing),
        ],
        
        // Item-specific responsive classes
        item && [
            getGridSizeClass(xs),
            getGridSizeClass(sm, 'sm'),
            getGridSizeClass(md, 'md'),
            getGridSizeClass(lg, 'lg'),
            getGridSizeClass(xl, 'xl'),
        ],
        
        className
    );

    return (
        <Component className={classes} style={style}>
            {children}
        </Component>
    );
};

export default Grid;