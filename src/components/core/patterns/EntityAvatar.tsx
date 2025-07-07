import React from 'react';
import { 
    UserIcon,
    BuildingOfficeIcon,
    CubeIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon 
} from '@heroicons/react/24/outline';

export interface EntityAvatarProps {
    entityType: 'contact' | 'organization' | 'product' | 'opportunity' | 'interaction';
    name: string;
    imageUrl?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Standardized entity avatar with type-specific fallback icons
 * Consolidates avatar patterns across different entity types
 */
export const EntityAvatar: React.FC<EntityAvatarProps> = ({
    entityType,
    name,
    imageUrl,
    size = 'md',
    className = ''
}) => {
    const getSizeClasses = (size: string) => {
        const sizeMap = {
            sm: 'h-8 w-8 text-xs',
            md: 'h-10 w-10 text-sm',
            lg: 'h-12 w-12 text-base',
        };
        return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
    };

    const getIconSize = (size: string) => {
        const iconSizeMap = {
            sm: 'h-4 w-4',
            md: 'h-5 w-5',
            lg: 'h-6 w-6',
        };
        return iconSizeMap[size as keyof typeof iconSizeMap] || iconSizeMap.md;
    };

    const getFallbackIcon = (entityType: string) => {
        const iconClass = getIconSize(size);
        switch (entityType) {
            case 'contact':
                return <UserIcon className={iconClass} />;
            case 'organization':
                return <BuildingOfficeIcon className={iconClass} />;
            case 'product':
                return <CubeIcon className={iconClass} />;
            case 'opportunity':
                return <CurrencyDollarIcon className={iconClass} />;
            case 'interaction':
                return <CalendarDaysIcon className={iconClass} />;
            default:
                return <UserIcon className={iconClass} />;
        }
    };

    const getBackgroundColor = (entityType: string) => {
        const colorMap = {
            contact: 'bg-primary-100 text-primary-600',
            organization: 'bg-secondary-100 text-secondary-600',
            product: 'bg-accent-100 text-accent-600',
            opportunity: 'bg-success-100 text-success-600',
            interaction: 'bg-warm-100 text-warm-600',
        };
        return colorMap[entityType as keyof typeof colorMap] || colorMap.contact;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`
                    ${getSizeClasses(size)}
                    rounded-full object-cover
                    ${className}
                `.trim()}
            />
        );
    }

    // Show initials for contacts and organizations, icons for others
    const showInitials = entityType === 'contact' || entityType === 'organization';

    return (
        <div
            className={`
                ${getSizeClasses(size)}
                rounded-full flex items-center justify-center
                ${getBackgroundColor(entityType)}
                ${className}
            `.trim()}
        >
            {showInitials ? getInitials(name) : getFallbackIcon(entityType)}
        </div>
    );
};