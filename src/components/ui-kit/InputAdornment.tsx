import React from 'react';

interface InputAdornmentProps {
    children?: React.ReactNode;
    className?: string;
    component?: React.ElementType;
    disablePointerEvents?: boolean;
    disableTypography?: boolean;
    position: 'start' | 'end';
    variant?: 'standard' | 'outlined' | 'filled';
}

export const InputAdornment: React.FC<InputAdornmentProps> = ({
    children,
    className = '',
    component: Component = 'div',
    disablePointerEvents = false,
    disableTypography = false,
    position,
    variant = 'outlined',
    ...props
}) => {
    const baseClasses = `
    flex items-center
    ${position === 'start' ? 'pr-2' : 'pl-2'}
    ${disablePointerEvents ? 'pointer-events-none' : ''}
    ${disableTypography ? '' : 'text-gray-500'}
    ${className}
  `;

    return (
        <Component className={baseClasses.trim()} {...props}>
            {children}
        </Component>
    );
};

export default InputAdornment; 