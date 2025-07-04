import React from 'react';
import { twMerge } from 'tailwind-merge';

type ChipProps = {
    label: React.ReactNode;
    className?: string;
    size?: 'small' | 'medium';
    style?: React.CSSProperties;
    onClick?: () => void;
};

export const Chip = ({
    label,
    className,
    size = 'medium',
    style,
    onClick,
}: ChipProps) => {
    const sizeClasses = size === 'small' ? 'h-5 px-2 text-xs' : 'h-6 px-3 text-sm';

    return (
        <div
            className={twMerge(
                'inline-flex items-center justify-center rounded-full bg-gray-200 font-medium text-gray-700',
                sizeClasses,
                className
            )}
            style={style}
            onClick={onClick}
        >
            {label}
        </div>
    );
};
