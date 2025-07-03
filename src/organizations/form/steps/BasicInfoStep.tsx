import React, { useCallback, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    TextInput,
    required,
    SelectInput,
    FormDataConsumer,
} from 'react-admin';
import { Business as BusinessIcon } from '@mui/icons-material';
import { StepComponentProps } from './types';
import { validateDuplicateOrganization } from './validation';

/**
 * Basic Information step component
 * Collects organization name and primary business type
 */
export const BasicInfoStep: React.FC<StepComponentProps> = ({
    formData,
    onDataChange,
    validationErrors,
    isMobile,
}) => {
    const [checkingDuplicate, setCheckingDuplicate] = useState(false);
    const [duplicateCheckResult, setDuplicateCheckResult] = useState<boolean | null>(null);

    // Business type options with descriptions
    const businessTypes = [
        { 
            value: 'restaurant', 
            label: 'Restaurant', 
            description: 'Full-service restaurants, cafes, and eateries',
            icon: '🍽️',
            color: '#ff6b35'
        },
        { 
            value: 'grocery', 
            label: 'Grocery Store', 
            description: 'Supermarkets, convenience stores, and food retailers',
            icon: '🛒',
            color: '#4CAF50'
        },
        { 
            value: 'distributor', 
            label: 'Food Distributor', 
            description: 'Wholesale food distribution and supply chain',
            icon: '🚛',
            color: '#2196F3'
        },
        { 
            value: 'manufacturer', 
            label: 'Food Manufacturer', 
            description: 'Food processing and manufacturing companies',
            icon: '🏭',
            color: '#9C27B0'
        },
        { 
            value: 'catering', 
            label: 'Catering Service', 
            description: 'Catering companies and event food services',
            icon: '🎪',
            color: '#FF9800'
        },
        { 
            value: 'other', 
            label: 'Other', 
            description: 'Other food industry businesses',
            icon: '🏢',
            color: '#607D8B'
        },
    ];

    // Handle name change with duplicate checking
    const handleNameChange = useCallback(async (name: string) => {
        const updatedData = { ...formData, name };
        onDataChange(updatedData);

        // Check for duplicates if name is long enough
        if (name && name.trim().length >= 3) {
            setCheckingDuplicate(true);
            try {
                const isUnique = await validateDuplicateOrganization(name);
                setDuplicateCheckResult(isUnique);
            } catch (error) {
                console.error('Duplicate check failed:', error);
                setDuplicateCheckResult(null);
            } finally {
                setCheckingDuplicate(false);
            }
        } else {
            setDuplicateCheckResult(null);
        }
    }, [formData, onDataChange]);

    // Handle business type change
    const handleBusinessTypeChange = useCallback((businessType: string) => {
        const updatedData = { ...formData, business_type: businessType };
        onDataChange(updatedData);
    }, [formData, onDataChange]);

    return (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <BusinessIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                    Organization Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Start by entering the basic information about the organization
                </Typography>
            </Box>

            <Stack spacing={3}>
                {/* Organization Name */}
                <FormDataConsumer>
                    {({ formData: currentData }) => (
                        <Box>
                            <TextInput
                                source="name"
                                label="Organization Name"
                                validate={required()}
                                fullWidth
                                onChange={(e) => handleNameChange(e.target.value)}
                                helperText={
                                    checkingDuplicate ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={12} />
                                            <span>Checking for duplicates...</span>
                                        </Box>
                                    ) : duplicateCheckResult === false ? (
                                        'An organization with this name already exists'
                                    ) : duplicateCheckResult === true ? (
                                        'Organization name is available'
                                    ) : (
                                        'Enter the full legal or commonly used name'
                                    )
                                }
                                error={duplicateCheckResult === false || !!validationErrors.name}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                    }
                                }}
                            />
                            
                            {/* Duplicate check status */}
                            {duplicateCheckResult === false && (
                                <Alert severity="error" sx={{ mt: 1 }}>
                                    This organization name is already in use. Please choose a different name.
                                </Alert>
                            )}
                            {duplicateCheckResult === true && (
                                <Alert severity="success" sx={{ mt: 1 }}>
                                    Great! This organization name is available.
                                </Alert>
                            )}
                        </Box>
                    )}
                </FormDataConsumer>

                {/* Business Type */}
                <FormControl 
                    fullWidth
                    error={!!validationErrors.business_type}
                >
                    <InputLabel id="business-type-label">Business Type</InputLabel>
                    <Select
                        labelId="business-type-label"
                        value={formData.business_type || ''}
                        label="Business Type"
                        onChange={(e) => handleBusinessTypeChange(e.target.value)}
                        sx={{ minHeight: '56px' }}
                    >
                        {businessTypes.map((type) => (
                            <MenuItem 
                                key={type.value} 
                                value={type.value}
                                sx={{ py: 1.5 }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: `${type.color}15`,
                                            borderRadius: 1,
                                            fontSize: '16px',
                                        }}
                                    >
                                        {type.icon}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2" sx={{ color: type.color }}>
                                            {type.label}
                                        </Typography>
                                        {!isMobile && (
                                            <Typography variant="caption" color="text.secondary">
                                                {type.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        {validationErrors.business_type || 'Select the primary business type'}
                    </FormHelperText>
                </FormControl>

                {/* Selected Business Type Preview */}
                {formData.business_type && (
                    <Box sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        backgroundColor: 'primary.light',
                        border: '1px solid',
                        borderColor: 'primary.main'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {businessTypes.find(type => type.value === formData.business_type) && (
                                <>
                                    <Box sx={{ fontSize: '24px' }}>
                                        {businessTypes.find(type => type.value === formData.business_type)?.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ color: 'primary.contrastText' }}>
                                            Selected: {businessTypes.find(type => type.value === formData.business_type)?.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'primary.contrastText', opacity: 0.9 }}>
                                            {businessTypes.find(type => type.value === formData.business_type)?.description}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Additional Business Type Input for 'Other' */}
                {formData.business_type === 'other' && (
                    <TextInput
                        source="custom_business_type"
                        label="Specify Business Type"
                        fullWidth
                        helperText="Please specify the type of business"
                        validate={required()}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                minHeight: '56px',
                            }
                        }}
                    />
                )}

                {/* Quick Tips */}
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="medium" gutterBottom>
                        💡 Quick Tips:
                    </Typography>
                    <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                        <li>Use the full legal or commonly known name</li>
                        <li>Business type helps with categorization and reporting</li>
                        <li>You can change these details later if needed</li>
                    </Box>
                </Alert>
            </Stack>
        </Box>
    );
};