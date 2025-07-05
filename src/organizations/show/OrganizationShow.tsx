import { Dialog, DialogContent, Button as UiKitButton } from '@/components/ui-kit';
import {
    PlusIcon as AddIcon,
    BuildingOffice2Icon as BusinessIcon,
    EnvelopeIcon as EmailIcon,
    UserCircleIcon as LinkedInIcon,
    MapPinIcon as LocationIcon,
    MapIcon,
    UserIcon as PersonIcon,
    PhoneIcon,
    StarIcon,
    GlobeAltIcon as WebsiteIcon
} from '@heroicons/react/24/outline';
import * as React from 'react';
import {
    DeleteButton,
    EditButton,
    Link,
    Show,
    TopToolbar,
    useGetList,
    useGetOne,
    useRecordContext
} from 'react-admin';
import { Box, Chip, Stack, Typography } from '../../components/ui-kit';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTwTheme } from '../../hooks/useTwTheme';
import { Contact, Organization, Setting } from '../../types';

const OrganizationShowActions = () => {
    const [showMap, setShowMap] = React.useState(false);
    const isFullScreen = useBreakpoint('md');
    const record = useRecordContext<Organization>();

    return (
        <>
            <TopToolbar>
                {/* Map Button - only show if organization has coordinates */}
                {record?.latitude && record?.longitude && (
                    <UiKitButton
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
                    </UiKitButton>
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
                    },
                }}
            >
                <DialogContent sx={{ p: 0, height: '100%' }}>
                    <Box>Map will be here</Box>
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
    const theme = useTwTheme();

    // Fetch Settings for display
    const { data: priority } = useGetOne<Setting>(
        'settings',
        {
            id: record?.priority as any,
        },
        { enabled: !!record?.priority }
    );

    const { data: segment } = useGetOne<Setting>(
        'settings',
        {
            id: record?.segment as any,
        },
        { enabled: !!record?.segment }
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
            sort: { field: 'status', order: 'DESC' },
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
                `${record.address}, ${record.city}, ${record.stateAbbr} ${record.zipcode
                }`
            )}`;
            window.open(url, '_blank');
        }
    };

    return (
        <Box className="p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Organization Info */}
                <div className="md:col-span-2">
                    <div className="bg-white shadow rounded-lg">
                        <div className="p-4">
                            {/* Header */}
                            <Box className="flex items-center mb-6">
                                <BusinessIcon className="text-4xl text-blue-500 mr-4" />
                                <Box className="flex-grow">
                                    <Typography
                                        variant="h4"
                                        component="h1"
                                        className="font-semibold mb-1"
                                    >
                                        {record.name}
                                    </Typography>
                                    <Box className="flex gap-2 flex-wrap">
                                        {priority && (
                                            <Chip
                                                label={`Priority ${priority.label}`}
                                                style={{
                                                    backgroundColor:
                                                        priority.color ||
                                                        '#e0e0e0',
                                                }}
                                                className="text-black font-semibold"
                                            />
                                        )}
                                        {segment && (
                                            <Chip
                                                label={segment.label}
                                                className="border"
                                                style={{
                                                    borderColor: segment.color,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            {/* Quick Actions */}
                            <Box className="flex gap-2 mb-6 flex-wrap">
                                {record.phone && (
                                    <button
                                        onClick={handlePhoneClick}
                                        className="w-11 h-11 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                        aria-label="Call organization"
                                    >
                                        <PhoneIcon />
                                    </button>
                                )}
                                {record.accountManager && (
                                    <button
                                        onClick={handleEmailClick}
                                        className="w-11 h-11 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                        aria-label="Email account manager"
                                    >
                                        <EmailIcon />
                                    </button>
                                )}
                                {record.website && (
                                    <button
                                        onClick={handleWebsiteClick}
                                        className="w-11 h-11 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                        aria-label="Visit website"
                                    >
                                        <WebsiteIcon />
                                    </button>
                                )}
                                {(record.latitude || record.address) && (
                                    <button
                                        onClick={handleDirectionsClick}
                                        className="w-11 h-11 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                        aria-label="Get directions"
                                    >
                                        <LocationIcon />
                                    </button>
                                )}
                            </Box>

                            <hr className="my-6" />

                            {/* Contact Information */}
                            <Stack gap={4}>
                                <Typography
                                    variant="h6"
                                    className="font-semibold"
                                >
                                    Contact Information
                                </Typography>

                                {record.phone && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500"
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
                                            className="text-gray-500"
                                        >
                                            Website
                                        </Typography>
                                        <a
                                            href={record.website}
                                            target="_blank"
                                            className="text-blue-500 no-underline"
                                        >
                                            {record.website}
                                        </a>
                                    </Box>
                                )}

                                {record.accountManager && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500"
                                        >
                                            Account Manager
                                        </Typography>
                                        <a
                                            href={`mailto:${record.accountManager}`}
                                            className="text-blue-500 no-underline"
                                        >
                                            {record.accountManager}
                                        </a>
                                    </Box>
                                )}
                            </Stack>

                            {/* Address */}
                            {(record.address || record.city) && (
                                <>
                                    <hr className="my-6" />
                                    <Stack gap={4}>
                                        <Typography
                                            variant="h6"
                                            className="font-semibold"
                                        >
                                            Address
                                        </Typography>
                                        <Typography variant="body1">
                                            {record.address &&
                                                `${record.address}`}
                                            {record.address &&
                                                (record.city ||
                                                    record.stateAbbr) && <br />}
                                            {record.city && record.stateAbbr
                                                ? `${record.city}, ${record.stateAbbr}`
                                                : record.city ||
                                                record.stateAbbr}
                                            {record.zipcode &&
                                                ` ${record.zipcode}`}
                                        </Typography>
                                    </Stack>
                                </>
                            )}

                            {/* Notes */}
                            {record.notes && (
                                <>
                                    <hr className="my-6" />
                                    <Stack gap={4}>
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
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1">
                    <Stack gap={6}>
                        {/* Business Context */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-4">
                                <Typography
                                    variant="h6"
                                    className="font-semibold mb-4"
                                >
                                    Business Context
                                </Typography>

                                {segment && (
                                    <Box className="mb-4">
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500"
                                        >
                                            Business Segment
                                        </Typography>
                                        <Chip
                                            label={segment.label}
                                            size="small"
                                            style={{
                                                backgroundColor:
                                                    segment.color || '#e0e0e0',
                                            }}
                                            className="text-black mt-1"
                                        />
                                    </Box>
                                )}

                                {distributor && (
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500"
                                        >
                                            Primary Distributor
                                        </Typography>
                                        <Chip
                                            label={distributor.label}
                                            size="small"
                                            style={{
                                                backgroundColor:
                                                    distributor.color ||
                                                    '#e0e0e0',
                                            }}
                                            className="text-black mt-1"
                                        />
                                    </Box>
                                )}
                            </div>
                        </div>

                        {/* Contacts */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="p-4">
                                <Box className="flex justify-between items-center mb-4">
                                    <Typography
                                        variant="h6"
                                        className="font-semibold"
                                    >
                                        Contacts ({contacts?.length || 0})
                                    </Typography>
                                    <UiKitButton
                                        component={Link}
                                        to={`/contacts/create?organizationId=${record.id}`}
                                        variant="outlined"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        sx={{ minHeight: 44, px: 2 }}
                                    >
                                        Add Contact
                                    </UiKitButton>
                                </Box>

                                {contacts && contacts.length > 0 ? (
                                    <Stack gap={4}>
                                        {contacts.map(contact => (
                                            <ContactCard
                                                key={contact.id}
                                                contact={contact}
                                            />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box className="text-center py-6">
                                        <PersonIcon className="text-5xl text-gray-400 mb-2" />
                                        <Typography
                                            variant="body2"
                                            className="text-gray-500 mb-4"
                                        >
                                            No contacts yet
                                        </Typography>
                                        <UiKitButton
                                            component={Link}
                                            to={`/contacts/create?organizationId=${record.id}`}
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            sx={{ minHeight: 44 }}
                                        >
                                            Add First Contact
                                        </UiKitButton>
                                    </Box>
                                )}
                            </div>
                        </div>
                    </Stack>
                </div>
            </div>
        </Box>
    );
};

// Mini contact card for organization context
const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
    const theme = useTwTheme();

    // Fetch role setting for display
    const { data: role } = useGetOne<Setting>(
        'settings',
        {
            id: contact.role as any,
        },
        { enabled: !!contact.role }
    );

    const { data: influenceLevel } = useGetOne<Setting>(
        'settings',
        {
            id: contact.influenceLevel as any,
        },
        { enabled: !!contact.influenceLevel }
    );

    const getInitials = () => {
        const first = contact.firstName?.charAt(0) || '';
        const last = contact.lastName?.charAt(0) || '';
        return `${first}${last}`.toUpperCase();
    };

    const getInfluenceColor = () => {
        if (!influenceLevel?.color) return '#e0e0e0';
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
        if (contact.linkedin_url) {
            window.open(contact.linkedin_url, '_blank');
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 ease-in-out">
            <Link
                to={`/contacts/${contact.id}/show`}
                className="block p-4 no-underline text-black"
            >
                <Box className="flex items-center">
                    <div
                        className="w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: getInfluenceColor() }}
                    >
                        {getInitials()}
                    </div>

                    <Box className="flex-grow min-w-0">
                        <Box className="flex items-center mb-1">
                            <Typography
                                variant="subtitle1"
                                className="font-semibold mr-2"
                            >
                                {contact.firstName} {contact.lastName}
                            </Typography>
                            {contact.status === 'primary' && (
                                <Chip
                                    label={
                                        <span className="flex items-center">
                                            <StarIcon className="w-4 h-4 mr-1" />
                                            Primary
                                        </span>
                                    }
                                    size="small"
                                    className="h-5 bg-yellow-500 text-white font-semibold"
                                />
                            )}
                        </Box>

                        {role && (
                            <Typography
                                variant="body2"
                                className="text-gray-500 mb-1"
                            >
                                {role.label}
                            </Typography>
                        )}

                        <Box className="flex gap-1 flex-wrap">
                            {influenceLevel && (
                                <Chip
                                    label={influenceLevel.label}
                                    size="small"
                                    className="h-5 text-xs"
                                    style={{
                                        backgroundColor:
                                            influenceLevel.color || '#e0e0e0',
                                    }}
                                />
                            )}
                        </Box>
                    </Box>

                    <Box className="flex gap-1">
                        {contact.phone && (
                            <button
                                onClick={handlePhoneClick}
                                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                aria-label="Call contact"
                            >
                                <PhoneIcon />
                            </button>
                        )}
                        {contact.email && (
                            <button
                                onClick={handleEmailClick}
                                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                aria-label="Email contact"
                            >
                                <EmailIcon />
                            </button>
                        )}
                        {contact.linkedin_url && (
                            <button
                                onClick={handleLinkedInClick}
                                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                                aria-label="LinkedIn profile"
                            >
                                <LinkedInIcon />
                            </button>
                        )}
                    </Box>
                </Box>
            </Link>
        </div>
    );
};
