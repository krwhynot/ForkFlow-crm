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
    ReferenceField,
    Link,
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
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    LinkedIn as LinkedInIcon,
    Business as BusinessIcon,
    Star as StarIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { Contact, Setting, Organization } from '../types';
import { RelationshipBreadcrumbs } from '../components/navigation/RelationshipBreadcrumbs';
import { RelatedEntitiesSection } from '../components/navigation/RelatedEntitiesSection';

const ContactShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export const ContactShow = () => (
    <Show actions={<ContactShowActions />}>
        <ContactShowContent />
    </Show>
);

const ContactShowContent = () => {
    const record = useRecordContext<Contact>();
    const theme = useTheme();

    // Fetch Settings for display
    const { data: role } = useGetOne<Setting>(
        'settings',
        {
            id: record?.roleId,
        },
        { enabled: !!record?.roleId }
    );

    const { data: influenceLevel } = useGetOne<Setting>(
        'settings',
        {
            id: record?.influenceLevelId,
        },
        { enabled: !!record?.influenceLevelId }
    );

    const { data: decisionRole } = useGetOne<Setting>(
        'settings',
        {
            id: record?.decisionRoleId,
        },
        { enabled: !!record?.decisionRoleId }
    );

    // Fetch Organization
    const { data: organization } = useGetOne<Organization>(
        'organizations',
        {
            id: record?.organizationId,
        },
        { enabled: !!record?.organizationId }
    );

    if (!record) return null;

    const handlePhoneClick = () => {
        if (record.phone) {
            window.location.href = `tel:${record.phone}`;
        }
    };

    const handleEmailClick = () => {
        if (record.email) {
            window.location.href = `mailto:${record.email}`;
        }
    };

    const handleLinkedInClick = () => {
        if (record.linkedInUrl) {
            window.open(record.linkedInUrl, '_blank');
        }
    };

    const getInitials = () => {
        const first = record.firstName?.charAt(0) || '';
        const last = record.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    const getInfluenceColor = () => {
        if (!influenceLevel?.color) return theme.palette.grey[300];
        return influenceLevel.color;
    };

    return (
        <Box sx={{ p: 2 }}>
            <RelationshipBreadcrumbs
                currentEntity="contact"
                showContext={true}
                relationships={{
                    organization: organization
                }}
            />
            <Grid container spacing={3}>
                {/* Main Contact Info */}
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
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        mr: 3,
                                        backgroundColor: getInfluenceColor(),
                                        color: theme.palette.getContrastText(
                                            getInfluenceColor()
                                        ),
                                        fontWeight: 600,
                                        fontSize: '2rem',
                                    }}
                                >
                                    {getInitials()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                    >
                                        {record.firstName} {record.lastName}
                                        {record.isPrimary && (
                                            <Chip
                                                icon={
                                                    <StarIcon fontSize="small" />
                                                }
                                                label="Primary Contact"
                                                sx={{
                                                    ml: 2,
                                                    backgroundColor:
                                                        theme.palette.warning
                                                            .main,
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    '& .MuiChip-icon': {
                                                        color: 'white',
                                                    },
                                                }}
                                            />
                                        )}
                                    </Typography>
                                    {role && (
                                        <Typography
                                            variant="h6"
                                            color="text.secondary"
                                            sx={{ mb: 1 }}
                                        >
                                            {role.label}
                                        </Typography>
                                    )}
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {influenceLevel && (
                                            <Chip
                                                label={`${influenceLevel.label} Influence`}
                                                sx={{
                                                    backgroundColor:
                                                        influenceLevel.color ||
                                                        theme.palette.grey[300],
                                                    color: theme.palette.getContrastText(
                                                        influenceLevel.color ||
                                                            theme.palette
                                                                .grey[300]
                                                    ),
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                        {decisionRole && (
                                            <Chip
                                                label={decisionRole.label}
                                                variant="outlined"
                                                sx={{
                                                    borderColor:
                                                        decisionRole.color,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Organization */}
                            {organization && (
                                <>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                mb: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <BusinessIcon sx={{ mr: 1 }} />
                                            Organization
                                        </Typography>
                                        <Link
                                            to={`/organizations/${organization.id}/show`}
                                            style={{
                                                color: theme.palette.primary
                                                    .main,
                                                textDecoration: 'none',
                                                fontWeight: 500,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {organization.name}
                                        </Link>
                                    </Box>
                                    <Divider sx={{ my: 3 }} />
                                </>
                            )}

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
                                        aria-label="Call contact"
                                    >
                                        <PhoneIcon />
                                    </IconButton>
                                )}
                                {record.email && (
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
                                        aria-label="Email contact"
                                    >
                                        <EmailIcon />
                                    </IconButton>
                                )}
                                {record.linkedInUrl && (
                                    <IconButton
                                        onClick={handleLinkedInClick}
                                        sx={{
                                            minWidth: 44,
                                            minHeight: 44,
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'primary.dark',
                                            },
                                        }}
                                        aria-label="LinkedIn profile"
                                    >
                                        <LinkedInIcon />
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

                                {record.email && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Email
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={`mailto:${record.email}`}
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {record.email}
                                        </Typography>
                                    </Box>
                                )}

                                {record.phone && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Phone
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={`tel:${record.phone}`}
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            {record.phone}
                                        </Typography>
                                    </Box>
                                )}

                                {record.linkedInUrl && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            LinkedIn
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={record.linkedInUrl}
                                            target="_blank"
                                            sx={{
                                                color: 'primary.main',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            View LinkedIn Profile
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>

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

                                {role && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Role/Position
                                        </Typography>
                                        <Chip
                                            label={role.label}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    role.color ||
                                                    theme.palette.grey[300],
                                                color: theme.palette.getContrastText(
                                                    role.color ||
                                                        theme.palette.grey[300]
                                                ),
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )}

                                {influenceLevel && (
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Influence Level
                                        </Typography>
                                        <Chip
                                            label={influenceLevel.label}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    influenceLevel.color ||
                                                    theme.palette.grey[300],
                                                color: theme.palette.getContrastText(
                                                    influenceLevel.color ||
                                                        theme.palette.grey[300]
                                                ),
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )}

                                {decisionRole && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Decision Role
                                        </Typography>
                                        <Chip
                                            label={decisionRole.label}
                                            size="small"
                                            sx={{
                                                backgroundColor:
                                                    decisionRole.color ||
                                                    theme.palette.grey[300],
                                                color: theme.palette.getContrastText(
                                                    decisionRole.color ||
                                                        theme.palette.grey[300]
                                                ),
                                                mt: 0.5,
                                            }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Interactions - Enhanced */}
                        <RelatedEntitiesSection
                            entityType="contact"
                            title="Recent Interactions"
                            relatedType="interactions"
                            filter={{ contactId: record?.id }}
                            maxItems={3}
                            createLink={`/interactions/create?contactId=${record?.id}&organizationId=${record?.organizationId}`}
                            viewAllLink={`/interactions?filter=${JSON.stringify({ contactId: record?.id })}`}
                            emptyMessage="No interactions recorded yet. Log an interaction to start tracking engagement history."
                        />

                        {/* Related Opportunities */}
                        <RelatedEntitiesSection
                            entityType="contact"
                            title="Opportunities"
                            relatedType="opportunities"
                            filter={{ contactId: record?.id }}
                            maxItems={3}
                            createLink={`/opportunities/create?contactId=${record?.id}&organizationId=${record?.organizationId}`}
                            viewAllLink={`/opportunities?filter=${JSON.stringify({ contactId: record?.id })}`}
                            emptyMessage="No opportunities with this contact yet. Create one to start tracking potential deals."
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
