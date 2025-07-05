import React from 'react';
import { twMerge } from 'tailwind-merge';

interface AlertTitleProps extends React.HTMLAttributes<HTMLElement> {
    component?: React.ElementType;
}

/**
 * AlertTitle component provides a styled container for the title portion of an Alert.
 * It is intentionally simple and unopinionated beyond basic typography styling so
 * that callers can override or extend via tailwind classes.
 */
export const AlertTitle: React.FC<AlertTitleProps> = ({
    component: Component = 'div',
    children,
    className,
    ...props
}) => {
    if (!children) return null;

    const classes = twMerge('font-medium mb-1 text-sm', className);

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
};

export default AlertTitle; 