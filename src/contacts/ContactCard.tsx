import * as React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Box,
    Chip,
    IconButton,
    Avatar,
} from '../components/ui-kit';
import {
    PhoneIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    PencilIcon,
    StarIcon,
} from '@heroicons/react/24/outline';
import { useRecordContext, useGetOne, Link } from 'react-admin';
import { Contact, Setting, Organization } from '../types';

export const ContactCard = () => {
    const record = useRecordContext<Contact>();
    const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint

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

    const getContrastText = (backgroundColor: string) => {
        // Simple contrast calculation - use white text for dark colors
        const hex = backgroundColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? '#000000' : '#ffffff';
    };

    return (
        <Card
            className="h-full flex flex-col cursor-pointer hover:shadow-lg relative transition-shadow"
            style={{
                minHeight: isMobile ? '220px' : '260px',
            }}
        >
            {/* Primary Contact Badge */}
            {record.isPrimary && (
                <Box className="absolute top-2 right-2 z-10">
                    <Chip
                        icon={<StarIcon className="h-4 w-4 text-white" />}
                        label="Primary"
                        size="small"
                        className="font-semibold"
                        style={{
                            backgroundColor: '#f59e0b', // amber-500 (warning color)
                            color: 'white',
                        }}
                    />
                </Box>
            )}

            <CardContent className="flex-grow pb-2">
                {/* Contact Header */}
                <Box className="flex items-center mb-4">
                    <Avatar
                        size="lg"
                        className="mr-4 font-semibold"
                        style={{
                            backgroundColor: getInfluenceColor(),
                            color: getContrastText(getInfluenceColor()),
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box className="flex-grow min-w-0">
                        <Typography
                            variant="h6"
                            component="h2"
                            className="font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap"
                        >
                            {record.firstName} {record.lastName}
                        </Typography>
                        {role && (
                            <Typography variant="body2" className="text-gray-600">
                                {role.label}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Organization */}
                {organization && (
                    <Box className="mb-4">
                        <Typography
                            variant="body2"
                            className="text-gray-600 flex items-center mb-2"
                        >
                            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                            <Link
                                to={`/organizations/${organization.id}/show`}
                                className="text-blue-600 no-underline font-medium hover:text-blue-800"
                            >
                                {organization.name}
                            </Link>
                        </Typography>
                    </Box>
                )}

                {/* Contact Information */}
                <Box className="mb-4">
                    {record.email && (
                        <Typography
                            variant="body2"
                            className="text-gray-600 mb-2"
                        >
                            {record.email}
                        </Typography>
                    )}
                    {record.phone && (
                        <Typography variant="body2" className="text-gray-600">
                            {record.phone}
                        </Typography>
                    )}
                </Box>

                {/* Business Context Chips */}
                <Box className="flex flex-wrap gap-2 mb-4">
                    {influenceLevel && (
                        <Chip
                            label={influenceLevel.label}
                            size="small"
                            className="text-xs h-6"
                            style={{
                                backgroundColor: influenceLevel.color || '#d1d5db', // gray-300
                                color: getContrastText(influenceLevel.color || '#d1d5db'),
                            }}
                        />
                    )}
                    {decisionRole && (
                        <Chip
                            label={decisionRole.label}
                            size="small"
                            variant="outlined"
                            className="text-xs h-6"
                            style={{
                                borderColor: decisionRole.color || '#9ca3af', // gray-400
                                color: decisionRole.color || '#6b7280', // gray-500
                            }}
                        />
                    )}
                </Box>

                {/* Notes Preview */}
                {record.notes && (
                    <Typography
                        variant="body2"
                        className="text-gray-600 overflow-hidden leading-relaxed"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {record.notes}
                    </Typography>
                )}
            </CardContent>

            {/* Quick Actions */}
            <CardActions className="pt-0 justify-between">
                <Box className="flex gap-2">
                    {record.phone && (
                        <IconButton
                            size="small"
                            onClick={handlePhoneClick}
                            className="min-w-[44px] min-h-[44px] text-blue-600 hover:text-blue-800"
                            aria-label="Call contact"
                        >
                            <PhoneIcon className="h-4 w-4" />
                        </IconButton>
                    )}
                    {record.email && (
                        <IconButton
                            size="small"
                            onClick={handleEmailClick}
                            className="min-w-[44px] min-h-[44px] text-blue-600 hover:text-blue-800"
                            aria-label="Email contact"
                        >
                            <EnvelopeIcon className="h-4 w-4" />
                        </IconButton>
                    )}
                    {record.linkedInUrl && (
                        <IconButton
                            size="small"
                            onClick={handleLinkedInClick}
                            className="min-w-[44px] min-h-[44px] text-blue-600 hover:text-blue-800"
                            aria-label="LinkedIn profile"
                        >
                            {/* Using a generic external link icon since LinkedIn is not in Heroicons */}
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </IconButton>
                    )}
                </Box>
                <IconButton
                    size="small"
                    component={Link}
                    to={`/contacts/${record.id}/edit`}
                    className="min-w-[44px] min-h-[44px] text-gray-500 hover:text-gray-700"
                    aria-label="Edit contact"
                >
                    <PencilIcon className="h-4 w-4" />
                </IconButton>
            </CardActions>
        </Card>
    );
};
