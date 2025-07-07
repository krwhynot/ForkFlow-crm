import React from 'react';
import { Button } from '../buttons/Button';

export interface ActionButton {
    label: string;
    onClick?: () => void;
    variant?: 'contained' | 'outlined' | 'text';
    disabled?: boolean;
    icon?: React.ReactNode;
}

export interface ActionButtonGroupProps {
    actions: ActionButton[];
    orientation?: 'horizontal' | 'vertical';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Standardized action button group to replace repeated button layout patterns
 * Consolidates spacing, alignment, and responsive behavior
 */
export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
    actions,
    orientation = 'horizontal',
    size = 'md',
    className = ''
}) => {
    const getContainerClass = () => {
        const baseClass = 'flex';
        const orientationClass = orientation === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-2';
        const alignmentClass = orientation === 'horizontal' ? 'justify-center' : 'items-stretch';
        
        return `${baseClass} ${orientationClass} ${alignmentClass}`;
    };

    return (
        <div className={`${getContainerClass()} ${className}`}>
            {actions.map((action, index) => (
                <Button
                    key={index}
                    variant={action.variant || 'outlined'}
                    size={size}
                    disabled={action.disabled}
                    onClick={action.onClick}
                    startIcon={action.icon}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );
};