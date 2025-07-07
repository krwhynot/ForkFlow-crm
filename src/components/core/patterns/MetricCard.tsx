import React from 'react';
import { Card, CardContent } from '../cards';
import { Typography } from '../typography';

export interface MetricCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    disabled?: boolean;
    className?: string;
}

/**
 * Reusable MetricCard component for consistent metric display
 * Used in dashboards and reports for key performance indicators
 */
export const MetricCard: React.FC<MetricCardProps> = ({
    icon,
    value,
    label,
    disabled = false,
    className = '',
}) => {
    return (
        <Card className={`${disabled ? 'opacity-50' : ''} ${className}`}>
            <CardContent className="text-center py-6">
                <div className="metric-icon">{icon}</div>
                <Typography variant="h4" className="metric-value">
                    {value}
                </Typography>
                <Typography variant="body2" className="metric-label">
                    {label}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default MetricCard;