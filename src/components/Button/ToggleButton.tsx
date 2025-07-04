import React from 'react';
import { twMerge } from 'tailwind-merge';

type ToggleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    selected?: boolean;
    value?: any;
};

export const ToggleButton = React.forwardRef<
    HTMLButtonElement,
    ToggleButtonProps
>(({ className, selected, value, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={twMerge(
                'px-4 py-2 text-sm font-semibold border rounded-md focus:outline-none',
                selected
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                className
            )}
            {...props}
        />
    );
});

ToggleButton.displayName = 'ToggleButton';
