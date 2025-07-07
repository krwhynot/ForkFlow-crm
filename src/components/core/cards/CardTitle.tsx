import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../typography';

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
    children: React.ReactNode;
};

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Typography
                ref={ref}
                variant="h6"
                component="h2"
                className={twMerge('font-semibold', className)}
                {...props}
            >
                {children}
            </Typography>
        );
    }
);

CardTitle.displayName = 'CardTitle';
