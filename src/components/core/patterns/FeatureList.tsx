import React from 'react';
import { Typography } from '../typography/Typography';

export interface FeatureListProps {
    features: string[];
    variant?: 'bullets' | 'checkmarks' | 'dots';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Reusable feature list component to replace repeated feature list patterns
 * Consolidates spacing and bullet point styling across components
 */
export const FeatureList: React.FC<FeatureListProps> = ({
    features,
    variant = 'dots',
    size = 'md',
    className = ''
}) => {
    const getIndicatorElement = (variant: string, index: number) => {
        const indicators = {
            bullets: <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />,
            checkmarks: <div className="w-3 h-3 text-success-500">✓</div>,
            dots: <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />,
        };
        return indicators[variant as keyof typeof indicators] || indicators.dots;
    };

    const getSizeStyles = (size: string) => {
        const sizeMap = {
            sm: 'space-y-1',
            md: 'space-y-1',
            lg: 'space-y-2',
        };
        return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
    };

    const getTextVariant = (size: string) => {
        const variantMap = {
            sm: 'caption' as const,
            md: 'caption' as const,
            lg: 'body2' as const,
        };
        return variantMap[size as keyof typeof variantMap] || variantMap.md;
    };

    return (
        <div className={`${getSizeStyles(size)} ${className}`}>
            {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                        {getIndicatorElement(variant, index)}
                    </div>
                    <Typography variant={getTextVariant(size)} className="text-gray-600">
                        {feature}
                    </Typography>
                </div>
            ))}
        </div>
    );
};