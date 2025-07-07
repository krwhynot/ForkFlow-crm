import {
    Box,
    Card,
    CardContent,
    List,
    Typography,
    Button,
    CircularProgress,
    Badge,
} from '../../ui-kit';
import { EntityListItem, EntitySectionHeader } from '../patterns';
import {
    PlusIcon as AddIcon,
    ArrowRightIcon as ArrowForwardIcon,
    UserIcon as ContactIcon,
    EnvelopeIcon as EmailIcon,
    CalendarDaysIcon as InteractionIcon,
    CurrencyDollarIcon as MoneyIcon,
    ArrowTrendingUpIcon as OpportunityIcon,
    BuildingOfficeIcon as OrganizationIcon,
    PhoneIcon,
    CubeIcon as ProductIcon,
    ClockIcon as ScheduleIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useGetList, useRecordContext } from 'react-admin';
import {
    Contact,
    Deal,
    Interaction,
    Organization,
    Product
} from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

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
                return <ContactIcon className="h-5 w-5" />;
            case 'opportunities':
                return <OpportunityIcon className="h-5 w-5" />;
            case 'interactions':
                return <InteractionIcon className="h-5 w-5" />;
            case 'products':
                return <ProductIcon className="h-5 w-5" />;
            case 'organizations':
                return <OrganizationIcon className="h-5 w-5" />;
            default:
                return <ArrowForwardIcon className="h-5 w-5" />;
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

    const renderContactItem = (contact: Contact, isLast: boolean) => {
        const chips = [
            ...(contact.isPrimary ? [{ label: 'Primary', variant: 'primary' as const }] : []),
            ...(contact.phone ? [{ label: 'Phone', icon: <PhoneIcon className="h-3 w-3" />, variant: 'secondary' as const }] : []),
            ...(contact.email ? [{ label: 'Email', icon: <EmailIcon className="h-3 w-3" />, variant: 'secondary' as const }] : []),
        ];

        return (
            <EntityListItem
                key={contact.id}
                id={contact.id}
                linkTo={`/contacts/${contact.id}/show`}
                avatar={{
                    initials: `${contact.firstName?.charAt(0)}${contact.lastName?.charAt(0)}`
                }}
                primary={`${contact.firstName} ${contact.lastName}`}
                chips={chips}
                isLast={isLast}
            />
        );
    };

    const renderOpportunityItem = (opportunity: Deal, isLast: boolean) => {
        const chips = [
            { label: formatCurrency(opportunity.amount), icon: <MoneyIcon className="h-3 w-3" />, variant: 'success' as const },
            { label: opportunity.stage?.replace('_', ' '), variant: 'secondary' as const },
        ];

        const avatar = (
            <div className="relative">
                <OpportunityIcon className="h-8 w-8 text-yellow-600" />
                <Badge
                    content={`${opportunity.probability}%`}
                    className={`absolute -top-1 -right-1 text-xs h-4 min-w-6 ${opportunity.probability >= 75
                        ? 'bg-green-500 text-white'
                        : opportunity.probability >= 50
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}
                />
            </div>
        );

        return (
            <EntityListItem
                key={opportunity.id}
                id={opportunity.id}
                linkTo={`/opportunities/${opportunity.id}/show`}
                avatar={{ fallback: avatar }}
                primary={opportunity.name || `Opportunity #${opportunity.id}`}
                chips={chips}
                isLast={isLast}
            />
        );
    };

    const renderInteractionItem = (
        interaction: Interaction,
        isLast: boolean
    ) => {
        const chips = [
            { 
                label: formatDate(interaction.scheduledDate || interaction.createdAt), 
                icon: <ScheduleIcon className="h-3 w-3" />, 
                variant: 'secondary' as const 
            },
            { 
                label: interaction.isCompleted ? 'Completed' : 'Scheduled', 
                variant: interaction.isCompleted ? 'success' as const : 'secondary' as const 
            },
        ];

        const avatar = (
            <InteractionIcon
                className={`h-8 w-8 ${interaction.isCompleted
                    ? 'text-green-600'
                    : 'text-blue-600'
                    }`}
            />
        );

        return (
            <EntityListItem
                key={interaction.id}
                id={interaction.id}
                linkTo={`/interactions/${interaction.id}/show`}
                avatar={{ fallback: avatar }}
                primary={interaction.subject}
                chips={chips}
                isLast={isLast}
            />
        );
    };

    const renderProductItem = (product: Product, isLast: boolean) => {
        const chips = [
            { label: product.category, variant: 'secondary' as const },
            { label: formatCurrency(product.price), icon: <MoneyIcon className="h-3 w-3" />, variant: 'success' as const },
        ];

        return (
            <EntityListItem
                key={product.id}
                id={product.id}
                linkTo={`/products/${product.id}/show`}
                avatar={{ fallback: <ProductIcon className="h-8 w-8 text-green-600" /> }}
                primary={product.name}
                chips={chips}
                isLast={isLast}
            />
        );
    };

    const renderOrganizationItem = (
        organization: Organization,
        isLast: boolean
    ) => {
        const chips = [
            ...(organization.segment ? [{ label: organization.segment.label, variant: 'secondary' as const }] : []),
            ...(organization.contactCount ? [{ label: `${organization.contactCount} contacts`, variant: 'secondary' as const }] : []),
        ];

        return (
            <EntityListItem
                key={organization.id}
                id={organization.id}
                linkTo={`/organizations/${organization.id}/show`}
                avatar={{ fallback: <OrganizationIcon className="h-8 w-8 text-blue-600" /> }}
                primary={organization.name}
                chips={chips}
                isLast={isLast}
            />
        );
    };

    if (!record) return null;

    const defaultEmptyMessage = `No ${relatedType} found`;

    return (
        <Card>
            <CardContent>
                <Box className="flex justify-between items-center mb-4">
                    <Typography
                        variant="h6"
                        className="font-semibold flex items-center gap-2"
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
                            startIcon={<AddIcon className="h-4 w-4" />}
                            className="min-h-11 px-4"
                        >
                            {getCreateButtonText()}
                        </Button>
                    )}
                </Box>

                {isLoading ? (
                    <Box className="flex justify-center py-6">
                        <CircularProgress className="h-6 w-6" />
                    </Box>
                ) : error ? (
                    <Typography className="text-red-600 py-4" variant="body2">
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
                            <Box className="mt-4 text-center">
                                <Button
                                    component={Link}
                                    to={viewAllLink}
                                    variant="text"
                                    endIcon={<ArrowForwardIcon className="h-4 w-4" />}
                                >
                                    View All {title}
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box className="text-center py-6">
                        {getIcon()}
                        <Typography
                            variant="body2"
                            className="text-gray-600 mt-2 mb-4"
                        >
                            {emptyMessage || defaultEmptyMessage}
                        </Typography>
                        {createLink && (
                            <Button
                                component={Link}
                                to={createLink}
                                variant="contained"
                                startIcon={<AddIcon className="h-4 w-4" />}
                                className="min-h-11"
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
