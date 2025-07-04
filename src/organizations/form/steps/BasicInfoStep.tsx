import React, { useCallback, useState, useEffect } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    InputAdornment,
} from '@mui/material';
import {
    Box,
    Typography,
    Stack,
    Alert,
    Chip,
    CircularProgress,
} from '@/components/ui-kit';
import {
    TextInput,
    required,
    SelectInput,
    FormDataConsumer,
} from 'react-admin';
import {
    Business as BusinessIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { StepComponentProps } from './types';
import { useRealTimeValidation } from './useRealTimeValidation';
import {
    FieldValidationIndicator,
    ValidationSummary,
} from './ValidationProvider';

/**
 * Basic Information step component with enhanced real-time validation
 * Collects organization name and primary business type
 */
export const BasicInfoStep: React.FC<StepComponentProps> = ({
    formData,
    onDataChange,
    validationErrors,
    isMobile,
}) => {
    // Real-time validation hook
    const {
        isValidating,
        getStepValidation,
        getFieldErrors,
        getFieldWarnings,
        hasFieldErrors,
        hasFieldWarnings,
        checkDuplicate,
    } = useRealTimeValidation(formData, {
        debounceMs: 500,
        enableDuplicateCheck: true,
    });

    // Get current step validation
    const stepValidation = getStepValidation('basic');

    // Business type options with descriptions
    const businessTypes = [
        {
            value: 'restaurant',
            label: 'Restaurant',
            description: 'Full-service restaurants, cafes, and eateries',
            icon: '🍽️',
            color: '#ff6b35',
        },
        {
            value: 'grocery',
            label: 'Grocery Store',
            description: 'Supermarkets, convenience stores, and food retailers',
            icon: '🛒',
            color: '#4CAF50',
        },
        {
            value: 'distributor',
            label: 'Food Distributor',
            description: 'Wholesale food distribution and supply chain',
            icon: '🚛',
            color: '#2196F3',
        },
        {
            value: 'manufacturer',
            label: 'Food Manufacturer',
            description: 'Food processing and manufacturing companies',
            icon: '🏭',
            color: '#9C27B0',
        },
        {
            value: 'catering',
            label: 'Catering Service',
            description: 'Catering companies and event food services',
            icon: '🎪',
            color: '#FF9800',
        },
        {
            value: 'other',
            label: 'Other',
            description: 'Other food industry businesses',
            icon: '🏢',
            color: '#607D8B',
        },
    ];

    // Handle field changes
    const handleFieldChange = useCallback(
        (field: string, value: any) => {
            const updatedData = { ...formData, [field]: value };
            onDataChange(updatedData);
        },
        [formData, onDataChange]
    );

    // Get validation status for organization name
    const nameErrors = getFieldErrors('name');
    const nameWarnings = getFieldWarnings('name');
    const hasNameErrors = hasFieldErrors('name');
    const hasNameWarnings = hasFieldWarnings('name');

    // Get validation status for business type
    const businessTypeErrors = getFieldErrors('business_type');
    const hasBusinessTypeErrors = hasFieldErrors('business_type');

    return (
        <Box className="p-4 md:p-6">
            {/* Header */}
            <Box className="mb-6 text-center">
                <BusinessIcon
                    sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
                />
                <Typography variant="h6" className="mb-2">
                    Organization Details
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                    Start by entering the basic information about the
                    organization
                </Typography>
            </Box>

            {/* Real-time Validation Summary */}
            {(stepValidation.errors.length > 0 ||
                stepValidation.warnings.length > 0) && (
                <ValidationSummary
                    validation={stepValidation}
                    title="Form Validation"
                    collapsible={true}
                />
            )}

            <Stack gap={6}>
                {/* Organization Name with Real-time Validation */}
                <FormDataConsumer>
                    {({ formData: currentData }) => (
                        <Box className="">
                            <TextInput
                                source="name"
                                label="Organization Name"
                                validate={required()}
                                fullWidth
                                onChange={e =>
                                    handleFieldChange('name', e.target.value)
                                }
                                helperText={
                                    isValidating ? (
                                        <Box className="flex items-center gap-2">
                                            <CircularProgress size={12} />
                                            <span>Validating...</span>
                                        </Box>
                                    ) : hasNameErrors ? (
                                        nameErrors[0]?.message
                                    ) : hasNameWarnings ? (
                                        nameWarnings[0]?.message
                                    ) : (
                                        'Enter the full legal or commonly used name'
                                    )
                                }
                                error={hasNameErrors}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {isValidating ? (
                                                <CircularProgress size={16} />
                                            ) : hasNameErrors ? (
                                                <ErrorIcon
                                                    color="error"
                                                    fontSize="small"
                                                />
                                            ) : hasNameWarnings ? (
                                                <WarningIcon
                                                    color="warning"
                                                    fontSize="small"
                                                />
                                            ) : formData.name &&
                                              formData.name.length > 2 ? (
                                                <CheckIcon
                                                    color="success"
                                                    fontSize="small"
                                                />
                                            ) : null}
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        minHeight: '56px',
                                    },
                                }}
                            />

                            {/* Enhanced Validation Feedback */}
                            <FieldValidationIndicator
                                fieldName="name"
                                errors={nameErrors}
                                warnings={nameWarnings}
                                showIcon={false}
                                showText={true}
                            />
                        </Box>
                    )}
                </FormDataConsumer>

                {/* Business Type with Enhanced Validation */}
                <FormControl fullWidth error={hasBusinessTypeErrors}>
                    <InputLabel id="business-type-label">
                        Business Type
                    </InputLabel>
                    <Select
                        labelId="business-type-label"
                        value={formData.business_type || ''}
                        label="Business Type"
                        onChange={e =>
                            handleFieldChange('business_type', e.target.value)
                        }
                        sx={{ minHeight: '56px' }}
                    >
                        {businessTypes.map(type => (
                            <MenuItem
                                key={type.value}
                                value={type.value}
                                sx={{ py: 1.5 }}
                            >
                                <Box className="flex items-center gap-4 w-full">
                                    <Box
                                        className="w-8 h-8 flex items-center justify-center rounded text-base"
                                        style={{
                                            backgroundColor: `${type.color}15`,
                                        }}
                                    >
                                        {type.icon}
                                    </Box>
                                    <Box className="flex-1">
                                        <Typography
                                            variant="subtitle2"
                                            style={{ color: type.color }}
                                        >
                                            {type.label}
                                        </Typography>
                                        {!isMobile && (
                                            <Typography
                                                variant="caption"
                                                className="text-gray-600"
                                            >
                                                {type.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                        {hasBusinessTypeErrors
                            ? businessTypeErrors[0]?.message
                            : 'Select the primary business type'}
                    </FormHelperText>
                </FormControl>

                {/* Business Type Validation Indicator */}
                <FieldValidationIndicator
                    fieldName="business_type"
                    errors={businessTypeErrors}
                    warnings={[]}
                    showIcon={false}
                    showText={true}
                />

                {/* Selected Business Type Preview */}
                {formData.business_type && (
                    <Box className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <Box className="flex items-center gap-4">
                            {businessTypes.find(
                                type => type.value === formData.business_type
                            ) && (
                                <>
                                    <Box className="text-2xl">
                                        {
                                            businessTypes.find(
                                                type =>
                                                    type.value ===
                                                    formData.business_type
                                            )?.icon
                                        }
                                    </Box>
                                    <Box className="">
                                        <Typography
                                            variant="subtitle2"
                                            className="text-blue-800"
                                        >
                                            Selected:{' '}
                                            {
                                                businessTypes.find(
                                                    type =>
                                                        type.value ===
                                                        formData.business_type
                                                )?.label
                                            }
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            className="text-blue-700"
                                        >
                                            {
                                                businessTypes.find(
                                                    type =>
                                                        type.value ===
                                                        formData.business_type
                                                )?.description
                                            }
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
                            },
                        }}
                    />
                )}

                {/* Quick Tips */}
                <Alert severity="info" className="mt-4">
                    <Typography variant="body2" className="font-medium mb-2">
                        💡 Quick Tips:
                    </Typography>
                    <Box as="ul" className="mt-2 mb-0 pl-4">
                        <li>Use the full legal or commonly known name</li>
                        <li>
                            Business type helps with categorization and
                            reporting
                        </li>
                        <li>You can change these details later if needed</li>
                    </Box>
                </Alert>
            </Stack>
        </Box>
    );
};
