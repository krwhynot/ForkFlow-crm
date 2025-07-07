import React from 'react';
import { Typography } from '../typography/Typography';

export interface InfoFieldProps {
    icon?: React.ReactNode;
    label: string;
    value: string | React.ReactNode;
    variant?: 'horizontal' | 'vertical';
    className?: string;
}

/**
 * Standardized info field component for displaying labeled information
 * Consolidates repeated label-value patterns with optional icons
 */
export const InfoField: React.FC<InfoFieldProps> = ({
    icon,
    label,
    value,
    variant = 'vertical',
    className = ''
}) => {
    if (variant === 'horizontal') {
        return (
            <div className={`flex items-center space-x-3 ${className}`}>
                {icon && (
                    <div className="flex-shrink-0 text-gray-500">
                        {icon}
                    </div>
                )}
                <div className="flex items-center space-x-2 flex-1">
                    <Typography variant="body2" className="text-gray-500 min-w-0">
                        {label}:
                    </Typography>
                    <div className="flex-1">
                        {typeof value === 'string' ? (
                            <Typography variant="body2" className="text-secondary-800">
                                {value}
                            </Typography>
                        ) : (
                            value
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="flex items-center space-x-3">
                {icon && (
                    <div className="flex-shrink-0 text-gray-500">
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    <Typography variant="caption" className="text-gray-500">
                        {label}
                    </Typography>
                    <div className="mt-1">
                        {typeof value === 'string' ? (
                            <Typography variant="body2" className="text-secondary-800">
                                {value}
                            </Typography>
                        ) : (
                            value
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};