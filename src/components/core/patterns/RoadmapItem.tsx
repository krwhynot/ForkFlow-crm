import React from 'react';
import { Typography } from '../typography';

export interface RoadmapItemProps {
    title: string;
    description: string;
    isActive?: boolean;
    className?: string;
}

/**
 * Reusable RoadmapItem component for displaying development phases
 * Shows timeline items with active/inactive states
 */
export const RoadmapItem: React.FC<RoadmapItemProps> = ({
    title,
    description,
    isActive = false,
    className = '',
}) => {
    return (
        <div className={`roadmap-item ${isActive ? 'roadmap-item-active' : 'roadmap-item-inactive'} ${className}`}>
            <div className={`roadmap-indicator ${isActive ? 'bg-primary-500' : 'bg-gray-400'}`}></div>
            <div>
                <Typography variant="subtitle2" className={isActive ? 'text-primary-800' : 'text-gray-800'}>
                    {title}
                </Typography>
                <Typography variant="body2" className={isActive ? 'text-primary-600' : 'text-gray-600'}>
                    {description}
                </Typography>
            </div>
        </div>
    );
};

export default RoadmapItem;