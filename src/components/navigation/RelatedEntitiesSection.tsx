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
import { ListItemButton } from '@mui/material';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
    Business as OrganizationIcon,
    Person as ContactIcon,
    Inventory as ProductIcon,
    TrendingUp as OpportunityIcon,
    EventNote as InteractionIcon,
    Add as AddIcon,
    ArrowForward as ArrowForwardIcon,
    AttachMoney as MoneyIcon,
    Schedule as ScheduleIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
} from '@mui/icons-material';
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
                return <ContactIcon />;
            case 'opportunities':
                return <OpportunityIcon />;
            case 'interactions':
                return <InteractionIcon />;
            case 'products':
                return <ProductIcon />;
            case 'organizations':
                return <OrganizationIcon />;
            default:
                return <ArrowForwardIcon />;
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
                sx={{
                    minHeight: 64,
                    px: 2,
                    py: 1,
                }}
            >
                <ListItemIcon>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'secondary.main',
                        }}
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
                            sx={{ mt: 0.5 }}
                        >
                            {contact.isPrimary && (
                                <Chip
                                    label="Primary"
                                    size="small"
                                    color="primary"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                            {contact.phone && (
                                <Chip
                                    icon={<PhoneIcon sx={{ fontSize: 12 }} />}
                                    label="Phone"
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                            {contact.email && (
                                <Chip
                                    icon={<EmailIcon sx={{ fontSize: 12 }} />}
                                    label="Email"
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Stack>
                    }
                />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderOpportunityItem = (opportunity: Deal, isLast: boolean) => (
        <React.Fragment key={opportunity.id}>
            <ListItemButton
                component={Link}
                to={`/opportunities/${opportunity.id}/show`}
                sx={{
                    minHeight: 64,
                    px: 2,
                    py: 1,
                }}
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
                        sx={{
                            '& .MuiBadge-badge': {
                                fontSize: '0.6rem',
                                height: 16,
                                minWidth: 24,
                            },
                        }}
                    >
                        <OpportunityIcon
                            sx={{ fontSize: 32, color: 'warning.main' }}
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
                            sx={{ mt: 0.5 }}
                        >
                            <Chip
                                icon={<MoneyIcon sx={{ fontSize: 12 }} />}
                                label={formatCurrency(opportunity.amount)}
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Chip
                                label={opportunity.stage?.replace('_', ' ')}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Stack>
                    }
                />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
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
                sx={{
                    minHeight: 64,
                    px: 2,
                    py: 1,
                }}
            >
                <ListItemIcon>
                    <InteractionIcon
                        sx={{
                            fontSize: 32,
                            color: interaction.isCompleted
                                ? 'success.main'
                                : 'info.main',
                        }}
                    />
                </ListItemIcon>
                <ListItemText
                    primary={interaction.subject}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                        >
                            <Chip
                                icon={<ScheduleIcon sx={{ fontSize: 12 }} />}
                                label={formatDate(
                                    interaction.scheduledDate ||
                                        interaction.createdAt
                                )}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
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
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Stack>
                    }
                />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
            </ListItemButton>
            {!isLast && <Divider variant="inset" component="li" />}
        </React.Fragment>
    );

    const renderProductItem = (product: Product, isLast: boolean) => (
        <React.Fragment key={product.id}>
            <ListItemButton
                component={Link}
                to={`/products/${product.id}/show`}
                sx={{
                    minHeight: 64,
                    px: 2,
                    py: 1,
                }}
            >
                <ListItemIcon>
                    <ProductIcon sx={{ fontSize: 32, color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText
                    primary={product.name}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                        >
                            <Chip
                                label={product.category}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            <Chip
                                icon={<MoneyIcon sx={{ fontSize: 12 }} />}
                                label={formatCurrency(product.price)}
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                        </Stack>
                    }
                />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
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
                sx={{
                    minHeight: 64,
                    px: 2,
                    py: 1,
                }}
            >
                <ListItemIcon>
                    <OrganizationIcon
                        sx={{ fontSize: 32, color: 'primary.main' }}
                    />
                </ListItemIcon>
                <ListItemText
                    primary={organization.name}
                    secondary={
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.5 }}
                        >
                            {organization.segment && (
                                <Chip
                                    label={organization.segment.label}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                            {organization.contactCount && (
                                <Chip
                                    label={`${organization.contactCount} contacts`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                />
                            )}
                        </Stack>
                    }
                />
                <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
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
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
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
                            startIcon={<AddIcon />}
                            sx={{ minHeight: 44, px: 2 }}
                        >
                            {getCreateButtonText()}
                        </Button>
                    )}
                </Box>

                {isLoading ? (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 3,
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                ) : error ? (
                    <Typography color="error" variant="body2" sx={{ py: 2 }}>
                        Error loading {relatedType}
                    </Typography>
                ) : relatedEntities && relatedEntities.length > 0 ? (
                    <>
                        <List sx={{ py: 0 }}>
                            {relatedEntities.map((entity, index) =>
                                renderEntityItem(entity, index)
                            )}
                        </List>

                        {viewAllLink && relatedEntities.length >= maxItems && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Button
                                    component={Link}
                                    to={viewAllLink}
                                    variant="text"
                                    endIcon={<ArrowForwardIcon />}
                                >
                                    View All {title}
                                </Button>
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        {getIcon()}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, mb: 2 }}
                        >
                            {emptyMessage || defaultEmptyMessage}
                        </Typography>
                        {createLink && (
                            <Button
                                component={Link}
                                to={createLink}
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{ minHeight: 44 }}
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
