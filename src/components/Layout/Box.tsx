import React from 'react';
import { twMerge } from 'tailwind-merge';

type BoxProps = React.HTMLAttributes<HTMLDivElement>;

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={twMerge('box-border', className)}
                {...props}
            />
        );
    }
);

Box.displayName = 'Box';
