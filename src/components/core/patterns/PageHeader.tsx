import React from 'react';
import { Typography } from '../typography/Typography';
import { Card, CardHeader } from '../cards';

export interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

/**
 * Standardized page header component to replace repeated header patterns
 * Consolidates layout, spacing, and typography across page components
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon,
    actions,
    className = ''
}) => {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {icon && (
                            <div className="flex-shrink-0">
                                {icon}
                            </div>
                        )}
                        <div>
                            <Typography variant="h4" className="text-secondary-800">
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography variant="body2" className="text-secondary-600">
                                    {subtitle}
                                </Typography>
                            )}
                        </div>
                    </div>
                    
                    {actions && (
                        <div className="flex items-center space-x-2">
                            {actions}
                        </div>
                    )}
                </div>
            </CardHeader>
        </Card>
    );
};