import React from 'react';
import { twMerge } from 'tailwind-merge';

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={twMerge('p-4 border-b', className)}
                {...props}
            />
        );
    }
);

CardHeader.displayName = 'CardHeader';
