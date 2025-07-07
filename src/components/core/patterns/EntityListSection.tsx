import React from 'react';
import { Link } from 'react-admin';
import { PlusIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Typography } from '../typography/Typography';
import { Button } from '../buttons/Button';
import { Card, CardContent, CardHeader } from '../cards';
import { CircularProgress } from '../progress/CircularProgress';
import { PlaceholderSection } from './PlaceholderSection';

export interface EntityItem {
    id: string | number;
    title: string;
    subtitle?: string;
    metadata?: React.ReactNode;
    avatar?: React.ReactNode;
    link?: string;
}

export interface EntityListSectionProps {
    title: string;
    icon: React.ReactNode;
    items: EntityItem[];
    isLoading?: boolean;
    error?: any;
    createLink?: string;
    createLabel?: string;
    viewAllLink?: string;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    maxItems?: number;
    className?: string;
}

/**
 * Standardized entity list section for related entities
 * Consolidates repeated list patterns with consistent layout and actions
 */
export const EntityListSection: React.FC<EntityListSectionProps> = ({
    title,
    icon,
    items,
    isLoading = false,
    error,
    createLink,
    createLabel = 'Add',
    viewAllLink,
    emptyMessage = 'No items found',
    emptyIcon,
    maxItems = 5,
    className = ''
}) => {
    const displayItems = items.slice(0, maxItems);
    const hasMore = items.length > maxItems;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center py-8">
                    <CircularProgress size="md" />
                </div>
            );
        }

        if (error) {
            return (
                <PlaceholderSection
                    icon={emptyIcon || icon}
                    title="Error loading data"
                    description={error.message || 'An error occurred while loading the data'}
                    variant="center"
                />
            );
        }

        if (!displayItems.length) {
            return (
                <PlaceholderSection
                    icon={emptyIcon || icon}
                    title={emptyMessage}
                    action={createLink ? (
                        <Button
                            component={Link}
                            to={createLink}
                            variant="outlined"
                            size="sm"
                            startIcon={<PlusIcon className="h-4 w-4" />}
                        >
                            {createLabel}
                        </Button>
                    ) : undefined}
                    variant="center"
                />
            );
        }

        return (
            <div className="space-y-3">
                {displayItems.map((item, index) => (
                    <EntityListItem key={item.id} item={item} isLast={index === displayItems.length - 1} />
                ))}
                
                {(hasMore || viewAllLink) && (
                    <div className="pt-3 border-t border-gray-200">
                        {hasMore && (
                            <Typography variant="caption" className="text-gray-500 block mb-2">
                                Showing {displayItems.length} of {items.length} items
                            </Typography>
                        )}
                        {viewAllLink && (
                            <Button
                                component={Link}
                                to={viewAllLink}
                                variant="text"
                                size="sm"
                                endIcon={<ArrowRightIcon className="h-4 w-4" />}
                                className="w-full justify-center"
                            >
                                View All {title}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Typography variant="h6" className="flex items-center space-x-2 text-secondary-800">
                        <span className="text-gray-500">{icon}</span>
                        <span>{title}</span>
                        {!isLoading && items.length > 0 && (
                            <span className="text-sm font-normal text-gray-500">({items.length})</span>
                        )}
                    </Typography>
                    {createLink && !isLoading && (
                        <Button
                            component={Link}
                            to={createLink}
                            variant="outlined"
                            size="sm"
                            startIcon={<PlusIcon className="h-4 w-4" />}
                        >
                            {createLabel}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
};

interface EntityListItemProps {
    item: EntityItem;
    isLast: boolean;
}

const EntityListItem: React.FC<EntityListItemProps> = ({ item, isLast }) => {
    const content = (
        <div className={`flex items-start space-x-3 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
            {item.avatar && (
                <div className="flex-shrink-0">
                    {item.avatar}
                </div>
            )}
            <div className="flex-1 min-w-0">
                <Typography variant="body2" className="text-secondary-800 font-medium">
                    {item.title}
                </Typography>
                {item.subtitle && (
                    <Typography variant="caption" className="text-gray-600 block">
                        {item.subtitle}
                    </Typography>
                )}
                {item.metadata && (
                    <div className="mt-1">
                        {item.metadata}
                    </div>
                )}
            </div>
        </div>
    );

    if (item.link) {
        return (
            <Link 
                to={item.link} 
                className="block hover:bg-gray-50 -mx-3 px-3 rounded transition-colors"
            >
                {content}
            </Link>
        );
    }

    return content;
};