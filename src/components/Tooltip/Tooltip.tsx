import React from 'react';
import { twMerge } from 'tailwind-merge';

type TooltipProps = {
    title: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    arrow?: boolean;
    children: React.ReactElement;
    className?: string;
};

export const Tooltip = ({
    title,
    placement = 'top',
    arrow,
    children,
    className,
}: TooltipProps) => {
    const [open, setOpen] = React.useState(false);

    const placementClasses = {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {children}
            {open && (
                <div
                    className={twMerge(
                        'absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm',
                        placementClasses[placement],
                        className
                    )}
                >
                    {title}
                    {arrow && (
                        <div
                            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
                            style={{
                                top: placement === 'bottom' ? -4 : 'auto',
                                bottom: placement === 'top' ? -4 : 'auto',
                                left: placement === 'right' ? -4 : 'auto',
                                right: placement === 'left' ? -4 : 'auto',
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
