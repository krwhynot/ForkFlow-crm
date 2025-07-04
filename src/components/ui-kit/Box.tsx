import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
    ({ as: Component = 'div', className, ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={twMerge('box-border', className)}
                {...props}
            />
        );
    }
);

Box.displayName = 'Box';
