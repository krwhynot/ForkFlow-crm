import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Stack,
    Button,
    Divider,
    CircularProgress,
    Avatar,
    Badge,
} from '@/components/ui-kit';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
    BuildingOfficeIcon,
    UserIcon,
    CubeIcon,
    TrendingUpIcon,
    DocumentTextIcon,
    PlusIcon,
    ArrowRightIcon,
    CurrencyDollarIcon,
    ClockIcon,
    PhoneIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { Link, useGetList, useRecordContext } from 'react-admin';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
    Organization,
    Contact,
    Product,
    Deal,
    Interaction,
    Setting,
} from '../../types';

interface RelatedEntitiesSectionProps {
    /**
     * The entity type that this section is being displayed for
     */
    entityType:
        | 'organization'
        | 'contact'
        | 'product'
        | 'opportunity'
        | 'interaction';

    /**
     * Title of the section
     */
    title: string;

    /**
     * What type of related entities to display
     */
    relatedType:
        | 'contacts'
        | 'opportunities'
        | 'interactions'
        | 'products'
        | 'organizations';

    /**
     * Filter to apply when fetching related entities
     */
    filter: Record<string, any>;

    /**
     * Maximum number of items to display (default: 5)
     */
    maxItems?: number;

    /**
     * Link to create a new related entity
     */
    createLink?: string;

    /**
     * Link to view all related entities
     */
    viewAllLink?: string;

    /**
     * Custom empty state message
     */
    emptyMessage?: string;
}

export const RelatedEntitiesSection: React.FC<RelatedEntitiesSectionProps> = ({
    entityType,
    title,
    relatedType,
    filter,
    maxItems = 5,
    createLink,
    viewAllLink,
    emptyMessage,
}) => {
    const theme = useTheme();
    const record = useRecordContext();

    // Fetch related entities
    const {
        data: relatedEntities,
        isLoading,
        error,
    } = useGetList(getResourceName(relatedType), {
        filter,
        sort: { field: getSortField(relatedType), order: 'DESC' },
        pagination: { page: 1, perPage: maxItems },
    });

    function getResourceName(type: string): string {
        switch (type) {
            case 'contacts':
                return 'contacts';
            case 'opportunities':
                return 'deals'; // Backend uses deals table
            case 'interactions':
                return 'interactions';
            case 'products':
                return 'products';
            case 'organizations':
                return 'organizations';
            default:
                return type;
        }
    }

    function getSortField(type: string): string {
        switch (type) {
            case 'contacts':
                return 'lastName';
            case 'opportunities':
                return 'updatedAt';
            case 'interactions':
                return 'scheduledDate';
            case 'products':
                return 'name';
            case 'organizations':
                return 'name';
            default:
                return 'id';
        }
    }

    const getIcon = () => {
        switch (relatedType) {
            case 'contacts':
                return <UserIcon className="w-5 h-5" />;
            case 'opportunities':
                return <TrendingUpIcon className="w-5 h-5" />;
            case 'interactions':
                return <DocumentTextIcon className="w-5 h-5" />;
            case 'products':
                return <CubeIcon className="w-5 h-5" />;
            case 'organizations':
                return <BuildingOfficeIcon className="w-5 h-5" />;
            default:
                return <ArrowRightIcon className="w-5 h-5" />;
        }
    };

    const getCreateButtonText = () => {
        switch (relatedType) {
            case 'contacts':
                return 'Add Contact';
            case 'opportunities':
                return 'Create Opportunity';
            case 'interactions':
                return 'Log Interaction';
            case 'products':
                return 'Add Product';
            case 'organizations':
                return 'Add Organization';
            default:
                return 'Add';
        }
    };

    const renderEntityItem = (entity: any, index: number) => {
        const isLast = index === relatedEntities!.length - 1;

        switch (relatedType) {
            case 'contacts':
                return renderContactItem(entity as Contact, isLast);
            case 'opportunities':
                return renderOpportunityItem(entity as Deal, isLast);
            case 'interactions':
                return renderInteractionItem(entity as Interaction, isLast);
            case 'products':
                return renderProductItem(entity as Product, isLast);
            case 'organizations':
                return renderOrganizationItem(entity as Organization, isLast);
            default:
                return null;
        }
    };

        const renderContactItem = (contact: Contact, isLast: boolean) => (
        <React.Fragment key={contact.id}>
            <ListItemButton
                component={Link}
                to={`/contacts/${contact.id}/show`}
                className="min-h-[64px] px-2 py-1"
            >
                <ListItemIcon>
                    <Avatar
                                             className="w-10 h-10 bg-purple-600"
                    >
                        {contact.firstName?.charAt(0)}
                        {contact.lastName?.charAt(0)}
                    </Avatar>
                </ListItemIcon>
                <ListItemText
                    primary={`${contact.firstName} ${contact.lastName}`}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            className="mt-1"
                        >
                            {contact.isPrimary && (
                                <Chip
                                    label="Primary"
                                    size="small"
                                    color="primary"
                                    className="h-5 text-xs"
                                />
                            )}
                            {contact.phone && (
                                <Chip
                                    icon={<PhoneIcon className="w-3 h-3" />}
                                    label="Phone"
                                    size="small"
                                    variant="outlined"
                                    className="h-5 text-xs"
                                />
                            )}
                            {contact.email && (
                                <Chip
                                    icon={<EnvelopeIcon className="w-3 h-3" />}
                                    label="Email"
                                    size="small"
                                    variant="outlined"
                                    className="h-5 text-xs"
                                />
                            )}
                        </Stack>
                    }
                />
                <ArrowRightIcon className="text-gray-500" />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderOpportunityItem = (opportunity: Deal, isLast: boolean) => (
        <React.Fragment key={opportunity.id}>
            <ListItemButton
                component={Link}
                to={`/opportunities/${opportunity.id}/show`}
                className="min-h-[64px] px-2 py-1"
            >
                <ListItemIcon>
                    <Badge
                        badgeContent={`${opportunity.probability}%`}
                        color={
                            opportunity.probability >= 75
                                ? 'success'
                                : opportunity.probability >= 50
                                  ? 'warning'
                                  : 'default'
                        }
                        className="[&_.badge]:text-xs [&_.badge]:h-4 [&_.badge]:min-w-[24px]"
                    >
                        <TrendingUpIcon
                            className="w-8 h-8 text-orange-500"
                        />
                    </Badge>
                </ListItemIcon>
                <ListItemText
                    primary={
                        opportunity.name || `Opportunity #${opportunity.id}`
                    }
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            className="mt-1"
                        >
                            <Chip
                                icon={<CurrencyDollarIcon className="w-3 h-3" />}
                                label={formatCurrency(opportunity.amount)}
                                size="small"
                                color="success"
                                className="h-5 text-xs"
                            />
                            <Chip
                                label={opportunity.stage?.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                                className="h-5 text-xs"
                            />
                        </Stack>
                    }
                />
                <ArrowRightIcon className="text-gray-500" />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderInteractionItem = (
        interaction: Interaction,
        isLast: boolean
    ) => (
        <React.Fragment key={interaction.id}>
            <ListItemButton
                component={Link}
                to={`/interactions/${interaction.id}/show`}
                className="min-h-[64px] px-2 py-1"
            >
                <ListItemIcon>
                    <DocumentTextIcon
                        className={`w-8 h-8 ${interaction.isCompleted
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}
                    />
                </ListItemIcon>
                <ListItemText
                    primary={interaction.subject}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            className="mt-1"
                        >
                            <Chip
                                icon={<ClockIcon className="w-3 h-3" />}
                                label={formatDate(
                                    interaction.scheduledDate ||
                                        interaction.createdAt
                                )}
                                size="small"
                                variant="outlined"
                                className="h-5 text-xs"
                            />
                            <Chip
                                label={
                                    interaction.isCompleted
                                        ? 'Completed'
                                        : 'Scheduled'
                                }
                                size="small"
                                color={
                                    interaction.isCompleted
                                        ? 'success'
                                        : 'default'
                                }
                                className="h-5 text-xs"
                            />
                        </Stack>
                    }
                />
                <ArrowRightIcon className="text-gray-500" />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderProductItem = (product: Product, isLast: boolean) => (
        <React.Fragment key={product.id}>
            <ListItemButton
                component={Link}
                to={`/products/${product.id}/show`}
                className="min-h-[64px] px-2 py-1"
            >
                <ListItemIcon>
                    <CubeIcon className="w-8 h-8 text-green-600" />
                </ListItemIcon>
                <ListItemText
                    primary={product.name}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            className="mt-1"
                        >
                            <Chip
                                label={product.category}
                                size="small"
                                variant="outlined"
                                className="h-5 text-xs"
                            />
                            <Chip
                                icon={<CurrencyDollarIcon className="w-3 h-3" />}
                                label={formatCurrency(product.price)}
                                size="small"
                                color="success"
                                className="h-5 text-xs"
                            />
                        </Stack>
                    }
                />
                <ArrowRightIcon className="text-gray-500" />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderOrganizationItem = (
        organization: Organization,
        isLast: boolean
    ) => (
        <React.Fragment key={organization.id}>
            <ListItemButton
                component={Link}
                to={`/companies/${organization.id}/show`}
                className="min-h-[64px] px-2 py-1"
            >
                <ListItemIcon>
                    <BuildingOfficeIcon
                        className="w-8 h-8 text-blue-600"
                    />
                </ListItemIcon>
                <ListItemText
                    primary={organization.name}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            className="mt-1"
                        >
                            {organization.segment && (
                                <Chip
                                    label={organization.segment.label}
                                    size="small"
                                    variant="outlined"
                                    className="h-5 text-xs"
                                />
                            )}
                            {organization.contactCount && (
                                <Chip
                                    label={`${organization.contactCount} contacts`}
                                    size="small"
                                    variant="outlined"
                                    className="h-5 text-xs"
                                />
                            )}
                        </Stack>
                    }
                />
                <ArrowRightIcon className="text-gray-500" />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    if (!record) return null;

    const defaultEmptyMessage = `No ${relatedType} found`;

    return (
        <Card>
            <CardContent>
                <Box
                    className="flex justify-between items-center mb-2"
                >
                    <Typography
                        variant="h6"
                        className="font-semibold flex items-center gap-1"
                    >
                        {getIcon()}
                        {title} ({relatedEntities?.length || 0})
                    </Typography>

                    {createLink && (
                        <Button
                            component={Link}
                            to={createLink}
                            variant="outlined"
                            size="small"
                            startIcon={<PlusIcon className="w-4 h-4" />}
                            className="min-h-[44px] px-2"
                        >
                            {getCreateButtonText()}
                        </Button>
                    )}
                </Box>

                {isLoading ? (
                    <Box
                        className="flex justify-center py-3"
                    >
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="body2" className="py-2">
                        Error loading {relatedType}
                    </Typography>
                ) : relatedEntities && relatedEntities.length > 0 ? (
                    <>
                        <List className="py-0">
                            {relatedEntities.map((entity, index) =>
                                renderEntityItem(entity, index)
                            )}
                        </List>

                        {viewAllLink && relatedEntities.length >= maxItems && (
                            <Box className="mt-2 text-center">
                                <Button
                                    component={Link}
                                    to={viewAllLink}
                                    variant="text"
                                    endIcon={<ArrowRightIcon className="w-4 h-4" />}
                                >
                                    View All {title}
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box className="text-center py-3">
                        {getIcon()}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            className="mt-1 mb-2"
                        >
                            {emptyMessage || defaultEmptyMessage}
                        </Typography>
                        {createLink && (
                            <Button
                                component={Link}
                                to={createLink}
                                variant="contained"
                                startIcon={<PlusIcon className="w-4 h-4" />}
                                className="min-h-[44px]"
                            >
                                {getCreateButtonText()}
                            </Button>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};
