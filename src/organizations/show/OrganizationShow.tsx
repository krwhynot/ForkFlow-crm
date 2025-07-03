import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    UrlField,
    useRecordContext,
    useGetOne,
    TopToolbar,
    EditButton,
    DeleteButton,
    useGetList,
    CreateButton,
    Link,
    Button,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Stack,
    Divider,
    useTheme,
    Grid,
    Avatar,
    CardActionArea,
    Dialog,
    DialogContent,
    useMediaQuery,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    LocationOn as LocationIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Add as AddIcon,
    Star as StarIcon,
    LinkedIn as LinkedInIcon,
    History as HistoryIcon,
    EventNote as InteractionIcon,
    Map as MapIcon,
} from '@mui/icons-material';
import { Organization, Setting, Contact } from '../types';
import { OrganizationMapView } from './OrganizationMapView';
import { RelationshipBreadcrumbs } from '../components/navigation/RelationshipBreadcrumbs';
import { RelatedEntitiesSection } from '../components/navigation/RelatedEntitiesSection';

const OrganizationShowActions = () => {
    const [showMap, setShowMap] = React.useState(false);
    const theme = useTheme();
    const isFullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const record = useRecordContext<Organization>();

    return (
        <>
            <TopToolbar>
                {/* Map Button - only show if organization has coordinates */}
                {(record?.latitude && record?.longitude) && (
                    <Button
                        variant="outlined"
                        startIcon={<MapIcon />}
                        onClick={() => setShowMap(true)}
                        sx={{
                            marginRight: 1,
                            minHeight: 44,
                            px: 2,
                        }}
                    >
                        View on Map
                    </Button>
                )}
                <EditButton />
                <DeleteButton />
            </TopToolbar>

            {/* Map Dialog */}
            <Dialog
                open={showMap}
                onClose={() => setShowMap(false)}
                maxWidth={false}
                fullScreen={isFullScreen}
                PaperProps={{
                    sx: {
                        width: isFullScreen ? '100%' : '90vw',
                        height: isFullScreen ? '100%' : '90vh',
                        maxWidth: 'none',
                        maxHeight: 'none',
                    }
                }}
            >
                <DialogContent sx={{ p: 0, height: '100%' }}>
                    <OrganizationMapView onClose={() => setShowMap(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
};

export const OrganizationShow = () => (
    <Show actions={<OrganizationShowActions />}>
        <OrganizationShowContent />
    </Show>
);

const OrganizationShowContent = () => {
    const record = useRecordContext<Organization>();
    const theme = useTheme();

    // Fetch Settings for display
    const { data: priority } = useGetOne<Setting>(
        'settings',
        {
            id: record?.priorityId,
        },
        { enabled: !!record?.priorityId }
    );

    const { data: segment } = useGetOne<Setting>(
        'settings',
        {
            id: record?.segmentId,
        },
        { enabled: !!record?.segmentId }
    );

    const { data: distributor } = useGetOne<Setting>(
        'settings',
        {
            id: record?.distributorId,
        },
        { enabled: !!record?.distributorId }
    );

    // Fetch related contacts
    const { data: contacts } = useGetList<Contact>(
        'contacts',
        {
            filter: { organizationId: record?.id },
            sort: { field: 'isPrimary', order: 'DESC' },
            pagination: { page: 1, perPage: 100 },
        },
        { enabled: !!record?.id }
    );

    if (!record) return null;

    const handlePhoneClick = () => {
        if (record.phone) {
            window.location.href = `tel:${record.phone}`;
        }
    };

    const handleEmailClick = () => {
        if (record.accountManager) {
            window.location.href = `mailto:${record.accountManager}`;
        }
    };

    const handleWebsiteClick = () => {
        if (record.website) {
            window.open(record.website, '_blank');
        }
    };

    const handleDirectionsClick = () => {
        if (record.latitude && record.longitude) {
            const url = `https://maps.google.com/?q=${record.latitude},${record.longitude}`;
            window.open(url, '_blank');
        } else if (record.address) {
            const url = `https://maps.google.com/?q=${encodeURIComponent(
                `${record.address}, ${record.city}, ${record.state} ${record.zipCode}`
            )}`;
            window.open(url, '_blank');
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <RelationshipBreadcrumbs
                currentEntity="organization"
                showContext={true}
            />
            <Grid container spacing={3}>
                {/* Main Organization Info */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            {/* Header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <BusinessIcon
                                    sx={{
                                        fontSize: 40,
                                        color: 'primary.main',
                                        mr: 2,
                                    }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        {record.name}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {priority && (
                                            <Chip
                                                label={`Priority ${priority.label}`}
                                                sx={{
                                                    backgroundColor:
                                                        priority.color ||
                                                        theme.palette.grey[300],
                                                    color: theme.palette.getContrastText(
                                                        priority.color ||
                                                            theme.palette
                                                                .grey[300]
                                                    ),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                        {segment && (
                                            <Chip
                                                label={segment.label}
                                                variant="outlined"
                                                sx={{
                                                    borderColor: segment.color,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Quick Actions */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                    mb: 3,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {record.phone && (
                                    <IconButton
                                        onClick={handlePhoneClick}
                                        sx={{
                                            minWidth: 44,
                                            minHeight: 44,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        }}
                                        aria-label="Call organization"
                                    >
                                        <PhoneIcon />
                                    </IconButton>
                                )}
                                {record.accountManager && (
                                    <IconButton
                                        onClick={handleEmailClick}
                                        sx={{
                                            minWidth: 44,
                                            minHeight: 44,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        }}
                                        aria-label="Email account manager"
                                    >
                                        <EmailIcon />
                                    </IconButton>
                                )}
                                {record.website && (
                                    <IconButton
                                        onClick={handleWebsiteClick}
                                        sx={{
                                            minWidth: 44,
                                            minHeight: 44,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        }}
                                        aria-label="Visit website"
                                    >
                                        <WebsiteIcon />
                                    </IconButton>
                                )}
                                {(record.latitude || record.address) && (
                                    <IconButton
                                        onClick={handleDirectionsClick}
                                        sx={{
                                            minWidth: 44,
                                            minHeight: 44,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        }}
                                        aria-label="Get directions"
                                    >
                                        <LocationIcon />
                                    </IconButton>
                                )}
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Contact Information */}
                            <Stack spacing={2}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600 }}
                                >
                                    Contact Information
                                </Typography>

                                {record.phone && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Phone
                                        </Typography>
                                        <Typography variant="body1">
                                            {record.phone}
                                        </Typography>
                                    </Box>
                                )}

                                {record.website && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Website
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={record.website}
                                            target="_blank"
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {record.website}
                                        </Typography>
                                    </Box>
                                )}

                                {record.accountManager && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Account Manager
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={`mailto:${record.accountManager}`}
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {record.accountManager}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

                            {/* Address */}
                            {(record.address || record.city) && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Stack spacing={2}>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {record.address &&
                                                `${record.address}`}
                                            {record.address &&
                                                (record.city ||
                                                    record.state) && <br />}
                                            {record.city && record.state
                                                ? `${record.city}, ${record.state}`
                                                : record.city || record.state}
                                            {record.zipCode &&
                                                ` ${record.zipCode}`}
                                        </Typography>
                                    </Stack>
                                </>
                            )}

                            {/* Notes */}
                            {record.notes && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Stack spacing={2}>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Notes
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {record.notes}
                                        </Typography>
                                    </Stack>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Business Context */}
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2 }}
                                >
                                    Business Context
                                </Typography>

                                {segment && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Business Segment
                                        </Typography>
                                        <Chip
                                            label={segment.label}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    segment.color ||
                                                    theme.palette.grey[300],
                                                color: theme.palette.getContrastText(
                                                    segment.color ||
                                                        theme.palette.grey[300]
                                                ),
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )}

                                {distributor && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Primary Distributor
                                        </Typography>
                                        <Chip
                                            label={distributor.label}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    distributor.color ||
                                                    theme.palette.grey[300],
                                                color: theme.palette.getContrastText(
                                                    distributor.color ||
                                                        theme.palette.grey[300]
                                                ),
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contacts */}
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
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Contacts ({contacts?.length || 0})
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={`/contacts/create?organizationId=${record.id}`}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        sx={{ minHeight: 44, px: 2 }}
                                    >
                                        Add Contact
                                    </Button>
                                </Box>

                                {contacts && contacts.length > 0 ? (
                                    <Stack spacing={2}>
                                        {contacts.map(contact => (
                                            <ContactCard
                                                key={contact.id}
                                                contact={contact}
                                            />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <PersonIcon
                                            sx={{
                                                fontSize: 48,
                                                color: 'text.secondary',
                                                mb: 1,
                                            }}
                                        />
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 2 }}
                                        >
                                            No contacts yet
                                        </Typography>
                                        <Button
                                            component={Link}
                                            to={`/contacts/create?organizationId=${record.id}`}
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            sx={{ minHeight: 44 }}
                                        >
                                            Add First Contact
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Interactions - Enhanced */}
                        <RelatedEntitiesSection
                            entityType="organization"
                            title="Recent Interactions"
                            relatedType="interactions"
                            filter={{ organizationId: record?.id }}
                            maxItems={3}
                            createLink={`/interactions/create?organizationId=${record?.id}`}
                            viewAllLink={`/interactions?filter=${JSON.stringify({ organizationId: record?.id })}`}
                            emptyMessage="No interactions logged yet. Log an interaction to start tracking engagement history."
                        />

                        {/* Related Opportunities */}
                        <RelatedEntitiesSection
                            entityType="organization"
                            title="Opportunities"
                            relatedType="opportunities"
                            filter={{ organizationId: record?.id }}
                            maxItems={3}
                            createLink={`/opportunities/create?organizationId=${record?.id}`}
                            viewAllLink={`/opportunities?filter=${JSON.stringify({ organizationId: record?.id })}`}
                            emptyMessage="No opportunities with this organization yet. Create one to start tracking potential deals."
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

// Mini contact card for organization context
const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    const theme = useTheme();

    // Fetch role setting for display
    const { data: role } = useGetOne<Setting>(
        'settings',
        {
            id: contact.roleId,
        },
        { enabled: !!contact.roleId }
    );

    const { data: influenceLevel } = useGetOne<Setting>(
        'settings',
        {
            id: contact.influenceLevelId,
        },
        { enabled: !!contact.influenceLevelId }
    );

    const getInitials = () => {
        const first = contact.firstName?.charAt(0) || '';
        const last = contact.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    const getInfluenceColor = () => {
        if (!influenceLevel?.color) return theme.palette.grey[300];
        return influenceLevel.color;
    };

    const handlePhoneClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (contact.phone) {
            window.location.href = `tel:${contact.phone}`;
        }
    };

    const handleEmailClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (contact.email) {
            window.location.href = `mailto:${contact.email}`;
        }
    };

    const handleLinkedInClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (contact.linkedInUrl) {
            window.open(contact.linkedInUrl, '_blank');
        }
    };

    return (
        <Card
            sx={{
                border: 1,
                borderColor: 'divider',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 1,
                },
                transition: 'all 0.2s ease-in-out',
            }}
        >
            <CardActionArea
                component={Link}
                to={`/contacts/${contact.id}/show`}
                sx={{ p: 2 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        sx={{
                            width: 50,
                            height: 50,
                            mr: 2,
                            backgroundColor: getInfluenceColor(),
                            color: theme.palette.getContrastText(
                                getInfluenceColor()
                            ),
                            fontWeight: 600,
                            fontSize: '1.1rem',
                        }}
                    >
                        {getInitials()}
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600, mr: 1 }}
                            >
                                {contact.firstName} {contact.lastName}
                            </Typography>
                            {contact.isPrimary && (
                                <Chip
                                    icon={<StarIcon fontSize="small" />}
                                    label="Primary"
                                    size="small"
                                    sx={{
                                        height: 20,
                                        backgroundColor:
                                            theme.palette.warning.main,
                                        color: 'white',
                                        fontWeight: 600,
                                        '& .MuiChip-icon': {
                                            color: 'white',
                                        },
                                    }}
                                />
                            )}
                        </Box>

                        {role && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 0.5 }}
                            >
                                {role.label}
                            </Typography>
                        )}

                        <Box
                            sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}
                        >
                            {influenceLevel && (
                                <Chip
                                    label={influenceLevel.label}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.7rem',
                                        backgroundColor:
                                            influenceLevel.color ||
                                            theme.palette.grey[300],
                                        color: theme.palette.getContrastText(
                                            influenceLevel.color ||
                                                theme.palette.grey[300]
                                        ),
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {contact.phone && (
                            <IconButton
                                onClick={handlePhoneClick}
                                size="small"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                                aria-label="Call contact"
                            >
                                <PhoneIcon fontSize="small" />
                            </IconButton>
                        )}
                        {contact.email && (
                            <IconButton
                                onClick={handleEmailClick}
                                size="small"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                                aria-label="Email contact"
                            >
                                <EmailIcon fontSize="small" />
                            </IconButton>
                        )}
                        {contact.linkedInUrl && (
                            <IconButton
                                onClick={handleLinkedInClick}
                                size="small"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                }}
                                aria-label="LinkedIn profile"
                            >
                                <LinkedInIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
            </CardActionArea>
        </Card>
    );
};
