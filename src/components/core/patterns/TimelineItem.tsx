import React from 'react';
import { Typography } from '../typography/Typography';

export interface TimelineItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    timestamp: string;
    metadata?: React.ReactNode;
    disabled?: boolean;
    className?: string;
}

/**
 * Reusable timeline item component to standardize timeline/activity layouts
 * Replaces repeated timeline patterns with consistent spacing and structure
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({
    icon,
    title,
    subtitle,
    timestamp,
    metadata,
    disabled = false,
    className = ''
}) => {
    return (
        <div 
            className={`
                flex items-start space-x-4 p-4 rounded-lg
                ${disabled ? 'bg-gray-50 opacity-60' : 'bg-white border border-gray-200'}
                ${className}
            `.trim()}
        >
            <div className="flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <Typography 
                        variant="subtitle2" 
                        className={disabled ? "text-gray-500" : "text-secondary-800"}
                    >
                        {title}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {timestamp}
                    </Typography>
                </div>
                {subtitle && (
                    <Typography variant="body2" className="text-gray-600 mb-2">
                        {subtitle}
                    </Typography>
                )}
                {metadata && (
                    <div className="text-xs text-gray-500">
                        {metadata}
                    </div>
                )}
            </div>
        </div>
    );
};