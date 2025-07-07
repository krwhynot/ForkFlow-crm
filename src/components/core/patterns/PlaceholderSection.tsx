import React from 'react';
import { Typography } from '../typography/Typography';

export interface PlaceholderSectionProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'center' | 'left';
    className?: string;
}

/**
 * Standardized placeholder section for empty states and coming soon content
 * Consolidates repeated placeholder patterns with consistent styling
 */
export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
    icon,
    title,
    description,
    action,
    variant = 'center',
    className = ''
}) => {
    const containerClass = variant === 'center' 
        ? 'text-center py-8' 
        : 'py-6';

    const iconClass = variant === 'center'
        ? 'h-12 w-12 text-gray-400 mx-auto mb-4'
        : 'h-8 w-8 text-gray-400 mb-3';

    return (
        <div className={`${containerClass} ${className}`}>
            <div className={iconClass}>
                {icon}
            </div>
            <Typography 
                variant={variant === 'center' ? 'h6' : 'body1'} 
                className="text-gray-600 mb-2"
            >
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" className="text-gray-500 mb-4">
                    {description}
                </Typography>
            )}
            {action && (
                <div className={variant === 'center' ? 'flex justify-center' : ''}>
                    {action}
                </div>
            )}
        </div>
    );
};