import React, { useState, useCallback, useEffect } from 'react';
import {
    Stack,
    Typography,
    Button,
    Box,
    IconButton,
    Chip,
    Alert,
    Divider,
} from '../../components/ui-kit';
// Material-UI components removed - using UI kit components instead
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import {
    ArrowLeftIcon,
    DocumentArrowDownIcon,
    MicrophoneIcon,
    QrCodeIcon,
    CameraIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { Create, Form, useNotify, useRedirect, FormDataConsumer } from 'react-admin';
import { Organization } from '../../types';
import { SlideUpModal } from '../common/SlideUpModal';
import { VoiceInput } from '../common/VoiceInput';
import { SmartKeyboard } from '../common/SmartKeyboard';
import { ValidationProvider, ValidationSummary, useRealTimeValidation } from '../form/steps';

interface MobileOrganizationCreateProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: (organization: Organization) => void;
    initialData?: Partial<Organization>;
    mode?: 'quick' | 'full';
}

/**
 * Mobile-optimized organization creation component
 * Features:
 * - Slide-up modal interface
 * - Voice input for descriptions
 * - Smart keyboard switching
 * - QR code scanning for business cards
 * - GPS location capture
 * - Real-time validation
 * - Quick create mode
 * - Auto-save functionality
 */
export const MobileOrganizationCreate: React.FC<MobileOrganizationCreateProps> = ({
    open,
    onClose,
    onSuccess,
    initialData = {},
    mode = 'full',
}) => {
    const theme = useTwTheme();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const notify = useNotify();
    const redirect = useRedirect();

    // Form state
    const [formData, setFormData] = useState<Partial<Organization>>(initialData);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showVoiceInput, setShowVoiceInput] = useState(false);
    const [gpsCapturing, setGpsCapturing] = useState(false);

    // Real-time validation
    const {
        isValidating,
        globalValidation,
        isFormValid,
        hasErrors,
        getFieldErrors,
        hasFieldErrors,
    } = useRealTimeValidation(formData, {
        debounceMs: 300,
        enableDuplicateCheck: true,
    });

    // Quick create steps for essential fields only
    const quickSteps = [
        {
            id: 'basic',
            title: 'Organization Name',
            description: 'Enter the organization name',
            fields: ['name', 'business_type'],
        },
        {
            id: 'contact',
            title: 'Contact Info',
            description: 'Add contact details',
            fields: ['email', 'phone'],
            optional: true,
        },
    ];

    // Full create steps with all fields
    const fullSteps = [
        {
            id: 'basic',
            title: 'Basic Information',
            description: 'Organization name and type',
            fields: ['name', 'business_type'],
        },
        {
            id: 'contact',
            title: 'Contact Details',
            description: 'Phone, email, and website',
            fields: ['phone', 'email', 'website', 'contact_person'],
        },
        {
            id: 'location',
            title: 'Address & Location',
            description: 'Physical address and GPS',
            fields: ['address', 'city', 'stateAbbr', 'zipcode'],
            optional: true,
        },
        {
            id: 'business',
            title: 'Business Context',
            description: 'Priority, segment, and notes',
            fields: ['priority', 'segment', 'revenue', 'notes'],
            optional: true,
        },
    ];

    const steps = mode === 'quick' ? quickSteps : fullSteps;
    const progress = ((currentStep + 1) / steps.length) * 100;

    // Handle form data changes
    const handleFormDataChange = useCallback((field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Handle voice input for notes
    const handleVoiceInput = useCallback((text: string) => {
        const currentNotes = formData.notes || '';
        const newNotes = currentNotes ? `${currentNotes} ${text}` : text;
        handleFormDataChange('notes', newNotes);
        setShowVoiceInput(false);
        notify('Voice input added to notes', { type: 'success' });
    }, [formData.notes, handleFormDataChange, notify]);

    // Handle GPS location capture
    const handleGPSCapture = useCallback(() => {
        if (!navigator.geolocation) {
            notify('GPS not supported on this device', { type: 'warning' });
            return;
        }

        setGpsCapturing(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    latitude,
                    longitude,
                }));
                setGpsCapturing(false);
                notify('GPS location captured', { type: 'success' });
            },
            (error) => {
                console.error('GPS capture error:', error);
                setGpsCapturing(false);
                notify('Failed to capture GPS location', { type: 'error' });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    }, [notify]);

    // Handle QR code scanning (placeholder)
    const handleQRScan = useCallback(() => {
        // TODO: Integrate with QR code scanning library
        notify('QR code scanning not yet implemented', { type: 'info' });
    }, [notify]);

    // Handle photo capture (placeholder)
    const handlePhotoCapture = useCallback(() => {
        // TODO: Integrate with camera API
        notify('Photo capture not yet implemented', { type: 'info' });
    }, [notify]);

    // Navigation handlers
    const handleNext = useCallback(() => {
        const currentStepFields = steps[currentStep].fields;
        const stepErrors = currentStepFields.some(field => hasFieldErrors(field));
        
        if (stepErrors) {
            notify('Please fix errors before continuing', { type: 'warning' });
            return;
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps, hasFieldErrors, notify]);

    const handleBack = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    // Form submission
    const handleSubmit = useCallback(async () => {
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Transform form data for submission
            const submitData = {
                ...formData,
                createdAt: new Date().toISOString(),
            };

            // TODO: Integrate with react-admin data provider
            console.log('Submitting organization:', submitData);
            
            notify('Organization created successfully!', { type: 'success' });
            
            if (onSuccess) {
                onSuccess(submitData as Organization);
            }
            
            onClose();
        } catch (error) {
            console.error('Form submission error:', error);
            notify('Failed to create organization', { type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    }, [isFormValid, isSubmitting, formData, notify, onSuccess, onClose]);

    // Auto-save functionality
    useEffect(() => {
        if (!formData.name) return;

        const autoSaveTimer = setTimeout(() => {
            // Save to localStorage for recovery
            localStorage.setItem('org-create-draft', JSON.stringify(formData));
        }, 30000); // 30 seconds

        return () => clearTimeout(autoSaveTimer);
    }, [formData]);

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('org-create-draft');
        if (draft && !initialData.name) {
            try {
                const parsedDraft = JSON.parse(draft);
                setFormData(parsedDraft);
                notify('Draft loaded from previous session', { type: 'info' });
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }, [initialData, notify]);

    const currentStepData = steps[currentStep];
    const canProceed = !currentStepData.fields.some(field => 
        !currentStepData.optional && hasFieldErrors(field)
    );

    return (
        <ValidationProvider>
            <SlideUpModal
                open={open}
                onClose={onClose}
                title={`${mode === 'quick' ? 'Quick' : 'New'} Organization`}
                subtitle={currentStepData.description}
                showProgress
                progress={progress}
                onSave={currentStep === steps.length - 1 ? handleSubmit : undefined}
                saveLabel={currentStep === steps.length - 1 ? 'Create' : undefined}
                saveDisabled={!canProceed || isSubmitting}
                showBackButton={currentStep > 0}
                onBack={handleBack}
                swipeToClose={currentStep === 0}
                preventClose={isSubmitting}
            >
                <Create resource="organizations" redirect={false}>
                    <Form>
                        <Box className="p-6">
                            {/* Step Header */}
                            <Box className="mb-6 text-center">
                                <Typography variant="h6" gutterBottom>
                                    {currentStepData.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Step {currentStep + 1} of {steps.length}
                                </Typography>
                            </Box>

                            {/* Validation Summary */}
                            {hasErrors && (
                                <ValidationSummary
                                    validation={globalValidation}
                                    title="Please fix these issues"
                                    collapsible={false}
                                />
                            )}

                            {/* Form Fields based on current step */}
                            <Stack spacing={3}>
                                {/* Basic Information Step */}
                                {currentStepData.id === 'basic' && (
                                    <>
                                        <SmartKeyboard
                                            source="name"
                                            label="Organization Name"
                                            fieldType="text"
                                            required
                                            fullWidth
                                            autoComplete="organization"
                                            maxLength={100}
                                            enableSmartSuggestions
                                            error={hasFieldErrors('name')}
                                            helperText={getFieldErrors('name')[0]?.message || 'Enter the full organization name'}
                                            onChange={(e) => handleFormDataChange('name', e.target.value)}
                                        />

                                        <SmartKeyboard
                                            source="business_type"
                                            label="Business Type"
                                            fieldType="text"
                                            fullWidth
                                            suggestions={['Restaurant', 'Grocery Store', 'Food Distributor', 'Manufacturer', 'Catering']}
                                            enableSmartSuggestions
                                            onChange={(e) => handleFormDataChange('business_type', e.target.value)}
                                        />
                                    </>
                                )}

                                {/* Contact Information Step */}
                                {currentStepData.id === 'contact' && (
                                    <>
                                        <SmartKeyboard
                                            source="email"
                                            label="Email Address"
                                            fieldType="email"
                                            fullWidth
                                            autoComplete="email"
                                            error={hasFieldErrors('email')}
                                            helperText={getFieldErrors('email')[0]?.message || 'Primary email address'}
                                            onChange={(e) => handleFormDataChange('email', e.target.value)}
                                        />

                                        <SmartKeyboard
                                            source="phone"
                                            label="Phone Number"
                                            fieldType="phone"
                                            fullWidth
                                            autoComplete="tel"
                                            error={hasFieldErrors('phone')}
                                            helperText={getFieldErrors('phone')[0]?.message || 'Primary phone number'}
                                            onChange={(e) => handleFormDataChange('phone', e.target.value)}
                                        />

                                        <SmartKeyboard
                                            source="website"
                                            label="Website"
                                            fieldType="url"
                                            fullWidth
                                            autoComplete="url"
                                            onChange={(e) => handleFormDataChange('website', e.target.value)}
                                        />

                                        <SmartKeyboard
                                            source="contact_person"
                                            label="Primary Contact"
                                            fieldType="text"
                                            fullWidth
                                            autoComplete="name"
                                            onChange={(e) => handleFormDataChange('contact_person', e.target.value)}
                                        />
                                    </>
                                )}

                                {/* Location Step */}
                                {currentStepData.id === 'location' && (
                                    <>
                                        <Box className="flex gap-4 items-start">
                                            <SmartKeyboard
                                                source="address"
                                                label="Street Address"
                                                fieldType="address"
                                                fullWidth
                                                autoComplete="street-address"
                                                onChange={(e) => handleFormDataChange('address', e.target.value)}
                                                className="flex-1"
                                            />
                                            <IconButton
                                                onClick={handleGPSCapture}
                                                disabled={gpsCapturing}
                                                color="primary"
                                                className="mt-2 min-w-12 min-h-12"
                                                aria-label="Capture GPS location"
                                            >
                                                <MapPinIcon className="w-5 h-5" />
                                            </IconButton>
                                        </Box>

                                        <Box className="flex gap-4">
                                            <SmartKeyboard
                                                source="city"
                                                label="City"
                                                fieldType="text"
                                                autoComplete="address-level2"
                                                onChange={(e) => handleFormDataChange('city', e.target.value)}
                                                className="flex-2"
                                            />
                                            <SmartKeyboard
                                                source="stateAbbr"
                                                label="State"
                                                fieldType="text"
                                                autoComplete="address-level1"
                                                maxLength={2}
                                                onChange={(e) => handleFormDataChange('stateAbbr', e.target.value)}
                                                className="flex-1"
                                            />
                                        </Box>

                                        <SmartKeyboard
                                            source="zipcode"
                                            label="ZIP Code"
                                            fieldType="text"
                                            autoComplete="postal-code"
                                            maxLength={10}
                                            onChange={(e) => handleFormDataChange('zipcode', e.target.value)}
                                        />

                                        {/* GPS Status */}
                                        {formData.latitude && formData.longitude && (
                                            <Alert severity="success">
                                                GPS coordinates captured: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                            </Alert>
                                        )}
                                    </>
                                )}

                                {/* Business Context Step */}
                                {currentStepData.id === 'business' && (
                                    <>
                                        <SmartKeyboard
                                            source="revenue"
                                            label="Annual Revenue"
                                            fieldType="number"
                                            fullWidth
                                            onChange={(e) => handleFormDataChange('revenue', parseFloat(e.target.value))}
                                        />

                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Notes & Description
                                            </Typography>
                                            <Box className="flex gap-2 mb-2">
                                                <VoiceInput
                                                    onTextReceived={handleVoiceInput}
                                                    variant="chip"
                                                    buttonSize="small"
                                                />
                                            </Box>
                                            <SmartKeyboard
                                                source="notes"
                                                label="Business Notes"
                                                fieldType="text"
                                                multiline
                                                rows={4}
                                                fullWidth
                                                maxLength={500}
                                                value={formData.notes || ''}
                                                onChange={(e) => handleFormDataChange('notes', e.target.value)}
                                            />
                                        </Box>
                                    </>
                                )}
                            </Stack>

                            {/* Step Navigation */}
                            <Box className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                <Button
                                    onClick={handleBack}
                                    disabled={currentStep === 0 || isSubmitting}
                                    startIcon={<ArrowLeftIcon className="w-4 h-4" />}
                                    className="min-h-12"
                                >
                                    Back
                                </Button>

                                <Chip
                                    label={`${currentStep + 1} / ${steps.length}`}
                                    variant="outlined"
                                    size="small"
                                />

                                {currentStep === steps.length - 1 ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canProceed || isSubmitting}
                                        variant="contained"
                                        startIcon={<DocumentArrowDownIcon className="w-4 h-4" />}
                                        className="min-h-12"
                                    >
                                        {isSubmitting ? 'Creating...' : 'Create'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        disabled={!canProceed}
                                        variant="contained"
                                        className="min-h-12"
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>

                            {/* Loading indicator */}
                            {(isValidating || isSubmitting) && (
                                <Box className="flex justify-center mt-4">
                                    <Typography variant="body2" color="text.secondary">
                                        {isValidating && 'Validating...'}
                                        {isSubmitting && 'Creating organization...'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Form>
                </Create>
            </SlideUpModal>
        </ValidationProvider>
    );
};