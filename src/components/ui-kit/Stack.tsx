import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Box } from './Box';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: 'row' | 'col';
    gap?: number;
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    as?: React.ElementType;
}

const directionClasses: Record<string, string> = {
    row: 'flex-row',
    col: 'flex-col',
};

const alignClasses: Record<string, string> = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
};

const justifyClasses: Record<string, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
    (
        {
            direction = 'col',
            gap = 0,
            align,
            justify,
            className,
            as,
            ...props
        },
        ref
    ) => {
        const classes = twMerge(
            'flex',
            directionClasses[direction],
            align && alignClasses[align],
            justify && justifyClasses[justify],
            className
        );

        return (
            <Box
                ref={ref}
                as={as}
                className={classes}
                style={{ gap: `${gap * 0.25}rem`, ...props.style }}
                {...props}
            />
        );
    }
);

Stack.displayName = 'Stack';
