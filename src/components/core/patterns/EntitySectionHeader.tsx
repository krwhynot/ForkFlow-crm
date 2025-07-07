import React from 'react';
import { 
    Stack, 
    Typography, 
    Button, 
    CircularProgress, 
    Badge 
} from '../../ui-kit';
import { PlusIcon } from '@heroicons/react/24/outline';

export interface EntitySectionHeaderProps {
    title: string;
    icon: React.ReactNode;
    count?: number;
    loading?: boolean;
    onAdd?: () => void;
    addLabel?: string;
    className?: string;
}

/**
 * Reusable EntitySectionHeader component for consistent section headers
 * Reduces duplicate header patterns across entity sections
 */
export const EntitySectionHeader: React.FC<EntitySectionHeaderProps> = ({
    title,
    icon,
    count,
    loading = false,
    onAdd,
    addLabel = 'Add',
    className = '',
}) => {
    return (
        <Stack className={`flex-row items-center justify-between py-3 px-4 border-b border-gray-200 ${className}`}>
            <Stack className="flex-row items-center space-x-2">
                {icon}
                <Typography variant="h6" className="font-medium text-gray-900">
                    {title}
                </Typography>
                {loading ? (
                    <CircularProgress size={16} className="ml-2" />
                ) : (
                    count !== undefined && (
                        <Badge 
                            count={count} 
                            className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        />
                    )
                )}
            </Stack>
            {onAdd && (
                <Button
                    variant="outlined"
                    size="small"
                    onClick={onAdd}
                    startIcon={<PlusIcon className="h-4 w-4" />}
                    className="text-primary-600 border-primary-600 hover:bg-primary-50"
                >
                    {addLabel}
                </Button>
            )}
        </Stack>
    );
};

export default EntitySectionHeader;