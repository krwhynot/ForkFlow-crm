import React from 'react';

interface TableContainerProps {
    children?: React.ReactNode;
    className?: string;
    component?: React.ElementType;
}

export const TableContainer: React.FC<TableContainerProps> = ({
    children,
    className = '',
    component: Component = 'div',
    ...props
}) => {
    const baseClasses = `
    overflow-x-auto
    shadow-sm border border-gray-200 rounded-lg
    ${className}
  `;

    return (
        <Component className={baseClasses.trim()} {...props}>
            {children}
        </Component>
    );
};

export default TableContainer; 