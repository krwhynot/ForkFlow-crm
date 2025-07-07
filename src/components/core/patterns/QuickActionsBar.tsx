import React from 'react';

export interface QuickAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outlined';
    disabled?: boolean;
}

export interface QuickActionsBarProps {
    actions: QuickAction[];
    className?: string;
}

/**
 * Standardized quick actions bar for contact/entity actions
 * Consolidates repeated action button patterns with consistent spacing
 */
export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
    actions,
    className = ''
}) => {
    const getActionButtonClass = (variant: string = 'outlined') => {
        const variantMap = {
            primary: 'bg-primary-500 text-white hover:bg-primary-600',
            secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
            outlined: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        };
        return variantMap[variant as keyof typeof variantMap] || variantMap.outlined;
    };

    return (
        <div className={`flex flex-wrap gap-3 pt-4 border-t border-gray-200 ${className}`}>
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`
                        inline-flex items-center space-x-2 px-3 py-2 rounded-md
                        text-sm font-medium transition-colors duration-200
                        touch-target-interactive
                        ${getActionButtonClass(action.variant)}
                        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `.trim()}
                >
                    <span className="flex-shrink-0">
                        {action.icon}
                    </span>
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
};