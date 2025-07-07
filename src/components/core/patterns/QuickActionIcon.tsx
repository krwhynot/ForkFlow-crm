import React from 'react';

export interface QuickActionIconProps {
    icon: React.ReactNode;
    onClick: () => void;
    ariaLabel: string;
    className?: string;
}

/**
 * Reusable QuickActionIcon component for circular action buttons
 * Used in organization/contact details for phone, email, website actions
 */
export const QuickActionIcon: React.FC<QuickActionIconProps> = ({
    icon,
    onClick,
    ariaLabel,
    className = '',
}) => {
    return (
        <button
            onClick={onClick}
            className={`quick-action-icon ${className}`}
            aria-label={ariaLabel}
        >
            {icon}
        </button>
    );
};

export default QuickActionIcon;