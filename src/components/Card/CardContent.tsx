import React from 'react';
import { twMerge } from 'tailwind-merge';

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={twMerge('p-4', className)}
                {...props}
            />
        );
    }
);

CardContent.displayName = 'CardContent';
