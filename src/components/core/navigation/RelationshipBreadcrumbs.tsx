import { Box, Chip } from '../../ui-kit';
import {
    UserIcon as ContactIcon,
    CalendarDaysIcon as InteractionIcon,
    ChevronRightIcon as NavigateNextIcon,
    ArrowTrendingUpIcon as OpportunityIcon,
    BuildingOfficeIcon as OrganizationIcon,
    CubeIcon as ProductIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link as RouterLink, useRecordContext } from 'react-admin';
import { Contact, Deal, Interaction, Organization, Product } from '../../types';

interface RelationshipBreadcrumbsProps {
    /**
     * Current entity type being viewed
     */
    currentEntity:
    | 'organization'
    | 'contact'
    | 'product'
    | 'opportunity'
    | 'interaction';

    /**
     * Show relationship context - displays parent/related entities
     */
    showContext?: boolean;

    /**
     * Custom relationships to display
     */
    relationships?: {
        organization?: Organization;
        contact?: Contact;
        product?: Product;
        opportunity?: Deal;
        interaction?: Interaction;
    };
}

export const RelationshipBreadcrumbs: React.FC<
    RelationshipBreadcrumbsProps
> = ({ currentEntity, showContext = true, relationships = {} }) => {
    const record = useRecordContext();

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'organization':
                return <OrganizationIcon className="h-4 w-4 mr-1" />;
            case 'contact':
                return <ContactIcon className="h-4 w-4 mr-1" />;
            case 'product':
                return <ProductIcon className="h-4 w-4 mr-1" />;
            case 'opportunity':
                return <OpportunityIcon className="h-4 w-4 mr-1" />;
            case 'interaction':
                return <InteractionIcon className="h-4 w-4 mr-1" />;
            default:
                return null;
        }
    };

    const getEntityColorClass = (entityType: string) => {
        switch (entityType) {
            case 'organization':
                return 'text-blue-600 border-blue-600';
            case 'contact':
                return 'text-gray-600 border-gray-600';
            case 'product':
                return 'text-green-600 border-green-600';
            case 'opportunity':
                return 'text-yellow-600 border-yellow-600';
            case 'interaction':
                return 'text-blue-500 border-blue-500';
            default:
                return 'text-gray-500 border-gray-500';
        }
    };

    const getEntityBgClass = (entityType: string) => {
        switch (entityType) {
            case 'organization':
                return 'bg-blue-600';
            case 'contact':
                return 'bg-gray-600';
            case 'product':
                return 'bg-green-600';
            case 'opportunity':
                return 'bg-yellow-600';
            case 'interaction':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const buildBreadcrumbPath = () => {
        const breadcrumbs: Array<{
            entity: string;
            label: string;
            link?: string;
            current?: boolean;
        }> = [];

        // Build relationship chain based on current entity and available relationships
        if (
            currentEntity === 'contact' &&
            (relationships.organization || record?.organizationId)
        ) {
            const org = relationships.organization;
            if (org) {
                breadcrumbs.push({
                    entity: 'organization',
                    label: org.name,
                    link: `/organizations/${org.id}/show`,
                });
            }
        }

        if (currentEntity === 'opportunity' && relationships.organization) {
            const org = relationships.organization;
            breadcrumbs.push({
                entity: 'organization',
                label: org.name,
                link: `/organizations/${org.id}/show`,
            });

            if (relationships.contact) {
                const contact = relationships.contact;
                breadcrumbs.push({
                    entity: 'contact',
                    label: `${contact.firstName} ${contact.lastName}`,
                    link: `/contacts/${contact.id}/show`,
                });
            }

            if (relationships.product) {
                const product = relationships.product;
                breadcrumbs.push({
                    entity: 'product',
                    label: product.name,
                    link: `/products/${product.id}/show`,
                });
            }
        }

        if (currentEntity === 'interaction') {
            if (relationships.organization) {
                const org = relationships.organization;
                breadcrumbs.push({
                    entity: 'organization',
                    label: org.name,
                    link: `/organizations/${org.id}/show`,
                });
            }

            if (relationships.contact) {
                const contact = relationships.contact;
                breadcrumbs.push({
                    entity: 'contact',
                    label: `${contact.firstName} ${contact.lastName}`,
                    link: `/contacts/${contact.id}/show`,
                });
            }

            if (relationships.opportunity) {
                const opportunity = relationships.opportunity;
                breadcrumbs.push({
                    entity: 'opportunity',
                    label: opportunity.name || `Opportunity #${opportunity.id}`,
                    link: `/opportunities/${opportunity.id}/show`,
                });
            }
        }

        // Add current entity
        const currentLabel = getCurrentEntityLabel();
        if (currentLabel) {
            breadcrumbs.push({
                entity: currentEntity,
                label: currentLabel,
                current: true,
            });
        }

        return breadcrumbs;
    };

    const getCurrentEntityLabel = () => {
        if (!record) return '';

        switch (currentEntity) {
            case 'organization':
                return (record as Organization).name;
            case 'contact':
                const contact = record as Contact;
                return `${contact.firstName} ${contact.lastName}`;
            case 'product':
                return (record as Product).name;
            case 'opportunity':
                const deal = record as Deal;
                return deal.name || `Opportunity #${deal.id}`;
            case 'interaction':
                return (record as Interaction).subject;
            default:
                return '';
        }
    };

    if (!showContext || !record) {
        return null;
    }

    const breadcrumbPath = buildBreadcrumbPath();

    if (breadcrumbPath.length <= 1) {
        return null;
    }

    return (
        <Box className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
            <nav aria-label="relationship breadcrumbs" className="flex items-center space-x-2">
                {breadcrumbPath.map((crumb, index) => {
                    const isLast = index === breadcrumbPath.length - 1;
                    const colorClass = getEntityColorClass(crumb.entity);
                    const bgClass = getEntityBgClass(crumb.entity);

                    return (
                        <React.Fragment key={`${crumb.entity}-${index}`}>
                            {index > 0 && (
                                <NavigateNextIcon className="h-4 w-4 text-gray-400" />
                            )}

                            {isLast || !crumb.link ? (
                                <Chip
                                    label={crumb.label}
                                    size="small"
                                    className={`max-w-50 truncate ${isLast
                                        ? `${bgClass} text-white`
                                        : `bg-transparent ${colorClass}`
                                        }`}
                                />
                            ) : (
                                <RouterLink
                                    to={crumb.link}
                                    className="no-underline"
                                >
                                    <Chip
                                        label={crumb.label}
                                        size="small"
                                        className={`max-w-50 cursor-pointer ${colorClass} bg-transparent hover:bg-gray-100 truncate`}
                                    />
                                </RouterLink>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        </Box>
    );
};
