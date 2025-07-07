import React from 'react';
import { twMerge } from 'tailwind-merge';

type DialogContentProps = {
    children: React.ReactNode;
    className?: string;
};

export const DialogContent = ({ children, className }: DialogContentProps) => {
    return <div className={twMerge('p-4', className)}>{children}</div>;
};
