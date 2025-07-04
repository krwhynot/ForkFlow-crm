import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../Typography/Typography';

type DialogTitleProps = {
    children: React.ReactNode;
    className?: string;
};

export const DialogTitle = ({ children, className }: DialogTitleProps) => {
    return (
        <div className={twMerge('p-4 border-b', className)}>
            <Typography variant="h6" component="h2">
                {children}
            </Typography>
        </div>
    );
};
