import React, { useCallback, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Alert,
    Button,
    Grid,
    Paper,
    IconButton,
    Tooltip,
    Chip,
    Divider,
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as WebsiteIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Gps as GpsIcon,
    Check as CheckIcon,
} from '@mui/icons-material';
import {
    TextInput,
    FormDataConsumer,
} from 'react-admin';
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
            setGpsError('GPS location capture is not supported by this browser');
            return;
        }

        setGpsLoading(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const updatedData = {
                    ...formData,
                    latitude,
                    longitude,
                };
                onDataChange(updatedData);
                setGpsLoading(false);
            },
            (error) => {
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
    const handleFieldChange = useCallback((field: string, value: string) => {
        const updatedData = { ...formData, [field]: value };
        onDataChange(updatedData);
    }, [formData, onDataChange]);

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
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                    Contact Information
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Add contact details and address information for the organization
                </Typography>
            </Box>

            <Stack spacing={4}>
                {/* Contact Methods */}
                <Paper elevation={1} sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" />
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
                                        helperText={validationErrors.website || "Organization's website URL"}
                                        error={!!validationErrors.website}
                                        InputProps={{
                                            startAdornment: <WebsiteIcon sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('website', e.target.value)}
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
                                        helperText={validationErrors.phone || "Primary phone number"}
                                        error={!!validationErrors.phone}
                                        InputProps={{
                                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            handleFieldChange('phone', formatted);
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
                                        helperText={validationErrors.email || "Primary email address"}
                                        error={!!validationErrors.email}
                                        InputProps={{
                                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('email', e.target.value)}
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
                                        helperText={validationErrors.contact_person || "Main contact at the organization"}
                                        error={!!validationErrors.contact_person}
                                        InputProps={{
                                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('contact_person', e.target.value)}
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Address Information */}
                <Paper elevation={1} sx={{ p: 3 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2
                    }}>
                        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" />
                            Address & Location
                        </Typography>
                        
                        <Tooltip title="Capture current GPS location">
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={gpsLoading ? null : <GpsIcon />}
                                onClick={captureGPSLocation}
                                disabled={gpsLoading}
                                sx={{ 
                                    minHeight: '40px',
                                    minWidth: { xs: '40px', sm: 'auto' }
                                }}
                            >
                                {gpsLoading ? 'Getting GPS...' : isMobile ? '' : 'Capture GPS'}
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
                                        helperText={validationErrors.address || "Physical address of the organization"}
                                        error={!!validationErrors.address}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('address', e.target.value)}
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
                                        helperText={validationErrors.city || ""}
                                        error={!!validationErrors.city}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
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
                                        helperText={validationErrors.state || ""}
                                        error={!!validationErrors.state}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('state', e.target.value)}
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
                                        helperText={validationErrors.zipCode || "5-digit ZIP code"}
                                        error={!!validationErrors.zipCode}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                minHeight: '56px',
                                            }
                                        }}
                                        onChange={(e) => handleFieldChange('zipCode', e.target.value)}
                                    />
                                )}
                            </FormDataConsumer>
                        </Grid>
                    </Grid>

                    {/* GPS Status */}
                    {hasGPSCoordinates && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckIcon fontSize="small" />
                                <Typography variant="body2">
                                    GPS coordinates captured: {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                                </Typography>
                            </Box>
                        </Alert>
                    )}

                    {gpsError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {gpsError}
                        </Alert>
                    )}
                </Paper>

                {/* Contact Summary */}
                {(formData.phone || formData.email || formData.website) && (
                    <Paper elevation={1} sx={{ p: 3, backgroundColor: 'grey.50' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Contact Summary
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {formData.phone && (
                                <Chip
                                    icon={<PhoneIcon />}
                                    label={formData.phone}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                />
                            )}
                            {formData.email && (
                                <Chip
                                    icon={<EmailIcon />}
                                    label={formData.email}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                />
                            )}
                            {formData.website && (
                                <Chip
                                    icon={<WebsiteIcon />}
                                    label={formData.website}
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                />
                            )}
                        </Stack>
                    </Paper>
                )}

                {/* Quick Tips */}
                <Alert severity="info">
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                        💡 Contact Information Tips:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                        <li>Add at least one contact method (phone or email) for effective communication</li>
                        <li>GPS coordinates help with location-based features and directions</li>
                        <li>All contact information can be updated later</li>
                    </Box>
                </Alert>
            </Stack>
        </Box>
    );
};