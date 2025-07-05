import { Stack, Typography, Button, Box, Divider } from '../../components/ui-kit';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import { MapPinIcon } from '@heroicons/react/24/outline';
import {
    ReferenceInput,
    SelectInput,
    TextInput,
    required,
    useRecordContext,
    useGetList,
    useInput,
} from 'react-admin';
import { Organization, Setting } from '../types';

const isUrl = (url: string) => {
    if (!url) return;
    const UrlRegex = new RegExp(
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
    );
    if (!UrlRegex.test(url)) {
        return 'Must be a valid URL';
    }
};

const isEmail = (email: string) => {
    if (!email) return;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
        return 'Must be a valid email address';
    }
};

const isPhoneNumber = (phone: string) => {
    if (!phone) return;
    const phoneRegex = /^[\d\s\-\.\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
        return 'Must be a valid phone number';
    }
};

const isZipCode = (zipCode: string) => {
    if (!zipCode) return;
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode)) {
        return 'Must be a valid ZIP code (12345 or 12345-6789)';
    }
};

export const OrganizationInputs = () => {
    const theme = useTwTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <Stack gap={4} p={1}>
            <OrganizationDisplayInputs />
            <Stack gap={4} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={1}>
                    <OrganizationContactInputs />
                    <OrganizationContextInputs />
                </Stack>
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <Stack gap={4} flex={1}>
                    <OrganizationAddressInputs />
                    <OrganizationNotesInputs />
                    <OrganizationAccountManagerInput />
                </Stack>
            </Stack>
        </Stack>
    );
};

const OrganizationDisplayInputs = () => {
    const record = useRecordContext<Organization>();
    return (
        <Stack gap={2} flex={1}>
            <TextInput
                source="name"
                label="Organization Name"
                validate={required()}
                helperText={false}
                sx={{
                    mt: 0,
                }}
                fullWidth
            />
        </Stack>
    );
};

const OrganizationContactInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Contact Information</Typography>
            <TextInput
                source="website"
                label="Website"
                helperText={false}
                validate={isUrl}
            />
            <TextInput
                source="phone"
                label="Phone Number"
                helperText={false}
                validate={isPhoneNumber}
            />
        </Stack>
    );
};

const OrganizationContextInputs = () => {
    const { data: prioritySettings } = useGetList<Setting>('settings', {
        filter: { category: 'priority', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: segmentSettings } = useGetList<Setting>('settings', {
        filter: { category: 'segment', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: distributorSettings } = useGetList<Setting>('settings', {
        filter: { category: 'distributor', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return (
        <Stack>
            <Typography variant="h6">Business Context</Typography>
            <SelectInput
                source="priorityId"
                label="Priority"
                choices={
                    prioritySettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
            />
            <SelectInput
                source="segmentId"
                label="Business Segment"
                choices={
                    segmentSettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
            />
            <SelectInput
                source="distributorId"
                label="Primary Distributor"
                choices={
                    distributorSettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
            />
        </Stack>
    );
};

const OrganizationAddressInputs = () => {
    const record = useRecordContext<Organization>();

    // Get form inputs for GPS coordinates
    const latitudeInput = useInput({ source: 'latitude' });
    const longitudeInput = useInput({ source: 'longitude' });

    const captureGPSLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;

                    // Update form values
                    latitudeInput.field.onChange(latitude);
                    longitudeInput.field.onChange(longitude);

                    console.log('GPS Coordinates captured:', {
                        latitude,
                        longitude,
                    });
                    alert(
                        `GPS Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nCoordinates have been saved to the form.`
                    );
                },
                error => {
                    console.error('GPS capture error:', error);
                    alert(
                        'Unable to capture GPS location. Please check location permissions.'
                    );
                }
            );
        } else {
            alert('GPS location capture is not supported by this browser.');
        }
    };

    return (
        <Stack>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <Typography variant="h6">Address</Typography>
                <Button
                    size="small"
                    startIcon={<MapPinIcon className="w-4 h-4" />}
                    onClick={captureGPSLocation}
                    className="min-h-11 px-2"
                >
                    GPS
                </Button>
            </Box>
            <TextInput
                source="address"
                label="Street Address"
                helperText={false}
            />
            <TextInput source="city" label="City" helperText={false} />
            <TextInput source="state" label="State" helperText={false} />
            <TextInput
                source="zipCode"
                label="ZIP Code"
                helperText={false}
                validate={isZipCode}
            />

            {/* Hidden GPS coordinate inputs */}
            <TextInput source="latitude" sx={{ display: 'none' }} />
            <TextInput source="longitude" sx={{ display: 'none' }} />

            {/* GPS Coordinates Display */}
            {(record?.latitude && record?.longitude) ||
            (latitudeInput.field.value && longitudeInput.field.value) ? (
                <Box
                    sx={{
                        mt: 1,
                        p: 1,
                        bgcolor: 'success.light',
                        borderRadius: 1,
                    }}
                >
                    <Typography variant="caption" color="success.contrastText">
                        📍 GPS:{' '}
                        {(
                            latitudeInput.field.value || record?.latitude
                        )?.toFixed(6)}
                        ,{' '}
                        {(
                            longitudeInput.field.value || record?.longitude
                        )?.toFixed(6)}
                    </Typography>
                </Box>
            ) : null}
        </Stack>
    );
};

const OrganizationNotesInputs = () => {
    const record = useRecordContext<Organization>();
    const noteLength = record?.notes?.length || 0;
    const maxLength = 500;

    return (
        <Stack>
            <Typography variant="h6">Notes</Typography>
            <TextInput
                source="notes"
                label="Business Notes"
                multiline
                helperText={`${noteLength}/${maxLength} characters`}
                minRows={3}
                inputProps={{ maxLength }}
            />
        </Stack>
    );
};

const OrganizationAccountManagerInput = () => {
    return (
        <Stack>
            <Typography variant="h6">Account Manager</Typography>
            <TextInput
                source="accountManager"
                label="Account Manager Email"
                helperText="Default: john.smith@forkflow.com (will be set automatically if left blank)"
                validate={isEmail}
                placeholder="john.smith@forkflow.com"
            />
        </Stack>
    );
};
