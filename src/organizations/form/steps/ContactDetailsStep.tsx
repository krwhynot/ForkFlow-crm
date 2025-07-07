import {
    Alert,
    Box,
    Button,
    Chip,
    Grid,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '../../../components/ui-kit';
import { EnvelopeIcon, PhoneIcon, UserIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { FormDataConsumer, TextInput } from 'react-admin';
import { StepComponentProps } from './types';

/**
 * Contact Details step component
 * Collects website, phone, email, contact person, and address information
 */
export const ContactDetailsStep: React.FC<StepComponentProps> = ({
    formData,
    onDataChange,
    validationErrors,
    isMobile,
}) => {
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    // Handle GPS location capture
    const captureGPSLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGpsError(
                'GPS location capture is not supported by this browser'
            );
            return;
        }

        setGpsLoading(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const updatedData = {
                    ...formData,
                    latitude,
                    longitude,
                };
                onDataChange(updatedData);
                setGpsLoading(false);
            },
            error => {
                console.error('GPS capture error:', error);
                let errorMessage = 'Unable to capture GPS location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Location access denied by user.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Location request timed out.';
                        break;
                    default:
                        errorMessage += 'Unknown error occurred.';
                        break;
                }
                setGpsError(errorMessage);
                setGpsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        );
    }, [formData, onDataChange]);

    // Handle form field changes
    const handleFieldChange = useCallback(
        (field: string, value: string) => {
            const updatedData = { ...formData, [field]: value };
            onDataChange(updatedData);
        },
        [formData, onDataChange]
    );

    // Format phone number as user types
    const formatPhoneNumber = useCallback((value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX
        if (digits.length >= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else if (digits.length >= 3) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
            return digits;
        }
    }, []);

    // Check if GPS coordinates are available
    const hasGPSCoordinates = formData.latitude && formData.longitude;

    return (
        <Box className="p-4 md:p-6">
            {/* Header */}
            <Box className="mb-6 text-center">
                <PhoneIcon className="h-12 w-12 text-blue-600 mb-2" />
                <Typography variant="h6" className="mb-2">
                    Contact Information
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                    Add contact details and address information for the
                    organization
                </Typography>
            </Box>

            <Stack gap={8}>
                {/* Contact Methods */}
                <Paper elevation={1} className="p-6">
                    <Typography
                        variant="subtitle1"
                        className="mb-2 flex items-center gap-2"
                    >
                        <PhoneIcon className="h-4 w-4" />
                        Contact Methods
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Website */}
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="website"
                                        label="Website"
                                        fullWidth
                                        placeholder="https://example.com"
                                        helperText={
                                            validationErrors.website ||
                                            "Organization's website URL"
                                        }
                                        error={!!validationErrors.website}
                                        InputProps={{
                                            startAdornment: (
                                                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            ),
                                        }}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'website',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* Phone */}
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="phone"
                                        label="Phone Number"
                                        fullWidth
                                        placeholder="(555) 123-4567"
                                        helperText={
                                            validationErrors.phone ||
                                            'Primary phone number'
                                        }
                                        error={!!validationErrors.phone}
                                        InputProps={{
                                            startAdornment: (
                                                <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            ),
                                        }}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e => {
                                            const formatted = formatPhoneNumber(
                                                e.target.value
                                            );
                                            handleFieldChange(
                                                'phone',
                                                formatted
                                            );
                                        }}
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* Email */}
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="email"
                                        label="Email Address"
                                        fullWidth
                                        placeholder="contact@example.com"
                                        helperText={
                                            validationErrors.email ||
                                            'Primary email address'
                                        }
                                        error={!!validationErrors.email}
                                        InputProps={{
                                            startAdornment: (
                                                <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            ),
                                        }}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* Contact Person */}
                        <Grid item xs={12} md={6}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="contact_person"
                                        label="Primary Contact Person"
                                        fullWidth
                                        placeholder="John Smith"
                                        helperText={
                                            validationErrors.contact_person ||
                                            'Main contact at the organization'
                                        }
                                        error={
                                            !!validationErrors.contact_person
                                        }
                                        InputProps={{
                                            startAdornment: (
                                                <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                                            ),
                                        }}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'contact_person',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Address Information */}
                <Paper elevation={1} className="p-6">
                    <Box className="flex items-center justify-between mb-4">
                        <Typography
                            variant="subtitle1"
                            className="flex items-center gap-2"
                        >
                            <UserIcon className="h-4 w-4" />
                            Address & Location
                        </Typography>

                        <Tooltip title="Capture current GPS location">
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={gpsLoading ? null : <PhoneIcon className="h-4 w-4" />}
                                onClick={captureGPSLocation}
                                disabled={gpsLoading}
                                className="min-h-10 min-w-10 sm:min-w-auto"
                            >
                                {gpsLoading
                                    ? 'Getting GPS...'
                                    : isMobile
                                        ? ''
                                        : 'Capture GPS'}
                            </Button>
                        </Tooltip>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Street Address */}
                        <Grid item xs={12}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="address"
                                        label="Street Address"
                                        fullWidth
                                        placeholder="123 Main Street"
                                        helperText={
                                            validationErrors.address ||
                                            'Physical address of the organization'
                                        }
                                        error={!!validationErrors.address}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'address',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* City */}
                        <Grid item xs={12} md={4}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="city"
                                        label="City"
                                        fullWidth
                                        placeholder="San Francisco"
                                        helperText={validationErrors.city || ''}
                                        error={!!validationErrors.city}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'city',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* State */}
                        <Grid item xs={12} md={4}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="state"
                                        label="State"
                                        fullWidth
                                        placeholder="CA"
                                        helperText={
                                            validationErrors.state || ''
                                        }
                                        error={!!validationErrors.state}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'state',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>

                        {/* ZIP Code */}
                        <Grid item xs={12} md={4}>
                            <FormDataConsumer>
                                {({ formData: currentData }) => (
                                    <TextInput
                                        source="zipCode"
                                        label="ZIP Code"
                                        fullWidth
                                        placeholder="94105"
                                        helperText={
                                            validationErrors.zipCode ||
                                            '5-digit ZIP code'
                                        }
                                        error={!!validationErrors.zipCode}
                                        className="[&_.input-root]:min-h-14"
                                        onChange={e =>
                                            handleFieldChange(
                                                'zipCode',
                                                e.target.value
                                            )
                                        }
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>

                    {/* GPS Status */}
                    {hasGPSCoordinates && (
                        <Alert variant="success" className="mt-4">
                            <Box className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4" />
                                <Typography variant="body2">
                                    GPS coordinates captured:{' '}
                                    {formData.latitude?.toFixed(6)},{' '}
                                    {formData.longitude?.toFixed(6)}
                                </Typography>
                            </Box>
                        </Alert>
                    )}

                    {gpsError && (
                        <Alert variant="error" className="mt-4">
                            {gpsError}
                        </Alert>
                    )}
                </Paper>

                {/* Contact Summary */}
                {(formData.phone || formData.email || formData.website) && (
                    <Paper elevation={1} className="p-6 bg-gray-50">
                        <Typography variant="subtitle2" className="mb-2">
                            Contact Summary
                        </Typography>
                        <Stack direction="row" gap={2} className="flex-wrap">
                            {formData.phone && (
                                <Chip
                                    icon={<PhoneIcon className="h-4 w-4" />}
                                    label={formData.phone}
                                    size="small"
                                    className="border border-blue-600 bg-transparent text-blue-600"
                                />
                            )}
                            {formData.email && (
                                <Chip
                                    icon={<EnvelopeIcon className="h-4 w-4" />}
                                    label={formData.email}
                                    size="small"
                                    className="border border-blue-600 bg-transparent text-blue-600"
                                />
                            )}
                            {formData.website && (
                                <Chip
                                    icon={<UserIcon className="h-4 w-4" />}
                                    label={formData.website}
                                    size="small"
                                    className="border border-blue-600 bg-transparent text-blue-600"
                                />
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* Quick Tips */}
                <Alert variant="info">
                    <Typography variant="body2" className="font-medium mb-2">
                        💡 Contact Information Tips:
                    </Typography>
                    <Box as="ul" className="mt-2 mb-0 pl-4">
                        <li>
                            Add at least one contact method (phone or email) for
                            effective communication
                        </li>
                        <li>
                            GPS coordinates help with location-based features
                            and directions
                        </li>
                        <li>All contact information can be updated later</li>
                    </Box>
                </Alert>
            </Stack>
        </Box>
    );
};
