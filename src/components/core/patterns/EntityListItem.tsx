import React from 'react';
import { Link } from 'react-admin';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Chip,
    Stack,
    Divider,
} from '../../ui-kit';

export interface EntityListItemProps {
    id: string | number;
    linkTo: string;
    avatar?: {
        src?: string;
        fallback?: React.ReactNode;
        initials?: string;
    };
    primary: string;
    secondary?: React.ReactNode;
    chips?: Array<{
        label: string;
        icon?: React.ReactNode;
        variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    }>;
    isLast?: boolean;
    className?: string;
}

const getChipClasses = (variant: string = 'primary') => {
    const baseClasses = 'h-5 text-xs';
    const variants = {
        primary: 'bg-blue-100 text-blue-800',
        secondary: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
    };
    return `${baseClasses} ${variants[variant as keyof typeof variants] || variants.primary}`;
};

/**
 * Reusable EntityListItem component for consistent entity display patterns
 * Reduces code duplication and centralizes styling for entity lists
 */
export const EntityListItem: React.FC<EntityListItemProps> = ({
    id,
    linkTo,
    avatar,
    primary,
    secondary,
    chips = [],
    isLast = false,
    className = '',
}) => {
    return (
        <React.Fragment key={id}>
            <ListItem className={`entity-list-item ${className}`}>
                <Link to={linkTo} className="entity-link">
                    {avatar && (
                        <ListItemIcon>
                            <Avatar className="entity-avatar">
                                {avatar.src ? (
                                    <img src={avatar.src} alt="" className="w-full h-full object-cover" />
                                ) : avatar.fallback ? (
                                    avatar.fallback
                                ) : (
                                    avatar.initials
                                )}
                            </Avatar>
                        </ListItemIcon>
                    )}
                    <ListItemText
                        primary={primary}
                        secondary={
                            <>
                                {secondary}
                                {chips.length > 0 && (
                                    <Stack className="flex-row space-x-1 items-center mt-1">
                                        {chips.map((chip, index) => (
                                            <Chip
                                                key={index}
                                                icon={chip.icon}
                                                label={chip.label}
                                                size="small"
                                                className={getChipClasses(chip.variant)}
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </>
                        }
                    />
                </Link>
            </ListItem>
            {!isLast && <Divider />}
        </React.Fragment>
    );
};

export default EntityListItem;