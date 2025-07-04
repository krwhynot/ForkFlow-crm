import React from 'react';
import { twMerge } from 'tailwind-merge';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    component?: React.ElementType;
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, component: Component = 'div', ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={twMerge(
                    'bg-white shadow-md rounded-lg',
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';
