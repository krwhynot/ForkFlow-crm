import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface TableContainerProps {
    children: React.ReactNode;
    component?: React.ElementType;
    className?: string;
    style?: React.CSSProperties;
}

export const TableContainer: React.FC<TableContainerProps> = ({
    children,
    component: Component = 'div',
    className,
    style,
}) => {
    const containerClasses = twMerge(
        'overflow-x-auto overflow-y-auto',
        className
    );

    return (
        <Component className={containerClasses} style={style}>
            {children}
        </Component>
    );
};