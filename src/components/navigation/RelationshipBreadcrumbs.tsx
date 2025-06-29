import React from 'react';
import {
    Breadcrumbs,
    Link,
    Typography,
    Box,
    Chip,
    useTheme,
} from '@mui/material';
import {
    Business as OrganizationIcon,
    Person as ContactIcon,
    Inventory as ProductIcon,
    TrendingUp as OpportunityIcon,
    EventNote as InteractionIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useRecordContext } from 'react-admin';
import { Organization, Contact, Product, Deal, Interaction } from '../../types';

interface RelationshipBreadcrumbsProps {
    /**
     * Current entity type being viewed
     */
    currentEntity: 'organization' | 'contact' | 'product' | 'opportunity' | 'interaction';
    
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

export const RelationshipBreadcrumbs: React.FC<RelationshipBreadcrumbsProps> = ({
    currentEntity,
    showContext = true,
    relationships = {},
}) => {
    const theme = useTheme();
    const record = useRecordContext();

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'organization':
                return <OrganizationIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'contact':
                return <ContactIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'product':
                return <ProductIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'opportunity':
                return <OpportunityIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            case 'interaction':
                return <InteractionIcon sx={{ fontSize: 16, mr: 0.5 }} />;
            default:
                return null;
        }
    };

    const getEntityColor = (entityType: string) => {
        switch (entityType) {
            case 'organization':
                return theme.palette.primary.main;
            case 'contact':
                return theme.palette.secondary.main;
            case 'product':
                return theme.palette.success.main;
            case 'opportunity':
                return theme.palette.warning.main;
            case 'interaction':
                return theme.palette.info.main;
            default:
                return theme.palette.grey[500];
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
        if (currentEntity === 'contact' && (relationships.organization || record?.organizationId)) {
            const org = relationships.organization;
            if (org) {
                breadcrumbs.push({
                    entity: 'organization',
                    label: org.name,
                    link: `/companies/${org.id}/show`,
                });
            }
        }

        if (currentEntity === 'opportunity' && relationships.organization) {
            const org = relationships.organization;
            breadcrumbs.push({
                entity: 'organization',
                label: org.name,
                link: `/companies/${org.id}/show`,
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
                    link: `/companies/${org.id}/show`,
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
        <Box
            sx={{
                mb: 2,
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 1,
                border: `1px solid ${theme.palette.grey[200]}`,
            }}
        >
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="relationship breadcrumbs"
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        color: theme.palette.grey[400],
                    },
                }}
            >
                {breadcrumbPath.map((crumb, index) => {
                    const isLast = index === breadcrumbPath.length - 1;
                    const color = getEntityColor(crumb.entity);

                    if (isLast || !crumb.link) {
                        return (
                            <Chip
                                key={`${crumb.entity}-${index}`}
                                icon={getEntityIcon(crumb.entity) || undefined}
                                label={crumb.label}
                                variant={isLast ? 'filled' : 'outlined'}
                                size="small"
                                sx={{
                                    backgroundColor: isLast ? color : 'transparent',
                                    color: isLast ? 'white' : color,
                                    borderColor: color,
                                    '& .MuiChip-icon': {
                                        color: isLast ? 'white' : color,
                                    },
                                    maxWidth: 200,
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    },
                                }}
                            />
                        );
                    }

                    return (
                        <Link
                            key={`${crumb.entity}-${index}`}
                            component={RouterLink}
                            to={crumb.link}
                            underline="none"
                            sx={{ textDecoration: 'none' }}
                        >
                            <Chip
                                icon={getEntityIcon(crumb.entity) || undefined}
                                label={crumb.label}
                                variant="outlined"
                                size="small"
                                clickable
                                sx={{
                                    color: color,
                                    borderColor: color,
                                    '& .MuiChip-icon': {
                                        color: color,
                                    },
                                    '&:hover': {
                                        backgroundColor: `${color}10`,
                                    },
                                    maxWidth: 200,
                                    '& .MuiChip-label': {
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    },
                                }}
                            />
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};