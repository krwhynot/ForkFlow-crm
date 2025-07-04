import React from 'react';
import { twMerge } from 'tailwind-merge';

type DialogProps = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
};

export const Dialog = ({ open, onClose, children, className }: DialogProps) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className={twMerge(
                    'bg-white rounded-lg shadow-xl max-w-lg w-full',
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};
