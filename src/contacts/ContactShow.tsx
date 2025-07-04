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
    Grid,
    Avatar,
} from '../components/ui-kit';
import {
    PhoneIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    StarIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
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
    const getContrastText = (backgroundColor: string) => {
        // Simple contrast calculation - use white text for dark colors
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? '#000000' : '#ffffff';
    };

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
        if (!influenceLevel?.color) return '#d1d5db'; // gray-300
        return influenceLevel.color;
    };

    return (
        <Box className="p-4">
            <RelationshipBreadcrumbs
                currentEntity="contact"
                showContext={true}
                relationships={{
                    organization: organization,
                }}
            />
            <Grid container spacing={3}>
                {/* Main Contact Info */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            {/* Header */}
                            <Box className="flex items-center mb-6">
                                <Avatar
                                    size="2xl"
                                    className="mr-6 font-semibold text-3xl"
                                    style={{
                                        backgroundColor: getInfluenceColor(),
                                        color: getContrastText(
                                            getInfluenceColor()
                                        ),
                                    }}
                                >
                                    {getInitials()}
                                </Avatar>
                                <Box className="flex-grow">
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        className="font-semibold mb-2"
                                    >
                                        {record.firstName} {record.lastName}
                                        {record.isPrimary && (
                                            <Chip
                                                icon={
                                                    <StarIcon className="h-4 w-4 text-white" />
                                                }
                                                label="Primary Contact"
                                                className="ml-4 font-semibold"
                                                style={{
                                                    backgroundColor: '#f59e0b', // amber-500
                                                    color: 'white',
                                                }}
                                            />
                                        )}
                                    </Typography>
                                    {role && (
                                        <Typography
                                            variant="h6"
                                            className="text-gray-600 mb-2"
                                        >
                                            {role.label}
                                        </Typography>
                                    )}
                                    <Box className="flex gap-2 flex-wrap">
                                        {influenceLevel && (
                                            <Chip
                                                label={`${influenceLevel.label} Influence`}
                                                className="font-semibold"
                                                style={{
                                                    backgroundColor:
                                                        influenceLevel.color ||
                                                        '#d1d5db', // gray-300
                                                    color: getContrastText(
                                                        influenceLevel.color ||
                                                            '#d1d5db'
                                                    ),
                                                }}
                                            />
                                        )}
                                        {decisionRole && (
                                            <Chip
                                                label={decisionRole.label}
                                                variant="outlined"
                                                style={{
                                                    borderColor:
                                                        decisionRole.color ||
                                                        '#9ca3af', // gray-400
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Organization */}
                            {organization && (
                                <>
                                    <Box className="mb-6">
                                        <Typography
                                            variant="h6"
                                            className="font-semibold mb-2 flex items-center"
                                        >
                                            <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                                            Organization
                                        </Typography>
                                        <Link
                                            to={`/organizations/${organization.id}/show`}
                                            className="text-blue-600 no-underline font-medium text-lg hover:text-blue-800"
                                        >
                                            {organization.name}
                                        </Link>
                                    </Box>
                                    <Divider className="my-6" />
                                </>
                            )}

                            {/* Quick Actions */}
                            <Box className="flex gap-2 mb-6 flex-wrap">
                                {record.phone && (
                                    <IconButton
                                        onClick={handlePhoneClick}
                                        className="min-w-[44px] min-h-[44px] bg-blue-600 text-white hover:bg-blue-700"
                                        aria-label="Call contact"
                                    >
                                        <PhoneIcon className="h-5 w-5" />
                                    </IconButton>
                                )}
                                {record.email && (
                                    <IconButton
                                        onClick={handleEmailClick}
                                        className="min-w-[44px] min-h-[44px] bg-blue-600 text-white hover:bg-blue-700"
                                        aria-label="Email contact"
                                    >
                                        <EnvelopeIcon className="h-5 w-5" />
                                    </IconButton>
                                )}
                                {record.linkedInUrl && (
                                    <IconButton
                                        onClick={handleLinkedInClick}
                                        className="min-w-[44px] min-h-[44px] bg-blue-600 text-white hover:bg-blue-700"
                                        aria-label="LinkedIn profile"
                                    >
                                        {/* Using a generic external link icon since LinkedIn is not in Heroicons */}
                                        <svg
                                            className="h-5 w-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                    </IconButton>
                                )}
                            </Box>

                            <Divider className="my-6" />

                            {/* Contact Information */}
                            <Stack spacing={2}>
                                <Typography
                                    variant="h6"
                                    className="font-semibold"
                                >
                                    Contact Information
                                </Typography>

                                {record.email && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Email
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={`mailto:${record.email}`}
                                            className="text-blue-600 no-underline hover:text-blue-800"
                                        >
                                            {record.email}
                                        </Typography>
                                    </Box>
                                )}

                                {record.phone && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Phone
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            component="a"
                                            href={`tel:${record.phone}`}
                                            className="text-blue-600 no-underline hover:text-blue-800"
                                        >
                                            {record.phone}
                                        </Typography>
                                    </Box>
                                )}

                                {record.linkedInUrl && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
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
                                    <Divider className="my-6" />
                                    <Stack spacing={2}>
                                        <Typography
                                            variant="h6"
                                            className="font-semibold"
                                        >
                                            Notes
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            className="whitespace-pre-wrap"
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
                                    className="font-semibold mb-4"
                                >
                                    Business Context
                                </Typography>

                                {role && (
                                    <Box className="mb-4">
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Role/Position
                                        </Typography>
                                        <Chip
                                            label={role.label}
                                            size="small"
                                            className="mt-2"
                                            style={{
                                                backgroundColor:
                                                    role.color || '#d1d5db', // gray-300
                                                color: getContrastText(
                                                    role.color || '#d1d5db'
                                                ),
                                            }}
                                        />
                                    </Box>
                                )}

                                {influenceLevel && (
                                    <Box className="mb-4">
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Influence Level
                                        </Typography>
                                        <Chip
                                            label={influenceLevel.label}
                                            size="small"
                                            className="mt-2"
                                            style={{
                                                backgroundColor:
                                                    influenceLevel.color ||
                                                    '#d1d5db', // gray-300
                                                color: getContrastText(
                                                    influenceLevel.color ||
                                                        '#d1d5db'
                                                ),
                                            }}
                                        />
                                    </Box>
                                )}

                                {decisionRole && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-600"
                                        >
                                            Decision Role
                                        </Typography>
                                        <Chip
                                            label={decisionRole.label}
                                            size="small"
                                            className="mt-2"
                                            style={{
                                                backgroundColor:
                                                    decisionRole.color ||
                                                    '#d1d5db', // gray-300
                                                color: getContrastText(
                                                    decisionRole.color ||
                                                        '#d1d5db'
                                                ),
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
