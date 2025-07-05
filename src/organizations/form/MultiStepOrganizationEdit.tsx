import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@/components/ui-kit';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTwTheme } from '../../hooks/useTwTheme';
import {
    ArrowLeftIcon as ArrowBackIcon,
    ArrowRightIcon as ArrowForwardIcon,
    CheckIcon,
    ExclamationCircleIcon as ErrorIcon,
    ExclamationTriangleIcon as WarningIcon,
    DocumentFloppyDiskIcon as SaveIcon,
    XMarkIcon as CloseIcon,
    ArrowPathIcon as RestoreIcon,
} from '@heroicons/react/24/outline';
import {
    Edit,
    Form,
    useGetIdentity,
    useNotify,
    useRedirect,
    SaveButton,
    FormDataConsumer,
    useRecordContext,
    required,
} from 'react-admin';
import { Organization } from '../../types';
import {
    BasicInfoStep,
    ContactDetailsStep,
    BusinessDetailsStep,
    StepValidationResult,
    FormStep,
    validateBasicInfo,
    validateContactDetails,
    validateBusinessDetails,
} from './steps';

interface MultiStepOrganizationEditProps {
    onClose?: () => void;
    isModal?: boolean;
    redirectOnSave?: string | false;
}

interface StepState {
    completed: boolean;
    hasErrors: boolean;
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    hasChanges: boolean;
}

/**
 * Multi-step organization edit form with change tracking and validation
 * Features:
 * - 3-step wizard with change detection
 * - Unsaved changes warning
 * - Form recovery and reset options
 * - Real-time validation with visual feedback
 * - Mobile-responsive design
 */
export const MultiStepOrganizationEdit: React.FC<
    MultiStepOrganizationEditProps
> = ({ onClose, isModal = false, redirectOnSave = 'show' }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const redirect = useRedirect();
    const record = useRecordContext<Organization>();

    // Form state
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<Partial<Organization>>(
        record || {}
    );
    const [originalData, setOriginalData] = useState<Partial<Organization>>(
        record || {}
    );
    const [stepStates, setStepStates] = useState<Record<number, StepState>>({
        0: {
            completed: false,
            hasErrors: false,
            isValid: true,
            errorCount: 0,
            warningCount: 0,
            hasChanges: false,
        },
        1: {
            completed: false,
            hasErrors: false,
            isValid: true,
            errorCount: 0,
            warningCount: 0,
            hasChanges: false,
        },
        2: {
            completed: false,
            hasErrors: false,
            isValid: true,
            errorCount: 0,
            warningCount: 0,
            hasChanges: false,
        },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] =
        useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<number | null>(
        null
    );

    // Initialize form data when record loads
    useEffect(() => {
        if (record) {
            setFormData(record);
            setOriginalData(record);
        }
    }, [record]);

    // Steps configuration
    const steps: FormStep[] = useMemo(
        () => [
            {
                id: 'basic-info',
                label: 'Basic Information',
                description: 'Organization name and primary details',
                icon: '🏢',
                component: BasicInfoStep,
                validate: validateBasicInfo,
                required: true,
            },
            {
                id: 'contact-details',
                label: 'Contact Details',
                description: 'Website, phone, and address information',
                icon: '📞',
                component: ContactDetailsStep,
                validate: validateContactDetails,
                required: false,
            },
            {
                id: 'business-details',
                label: 'Business Details',
                description: 'Priority, segment, and business context',
                icon: '💼',
                component: BusinessDetailsStep,
                validate: validateBusinessDetails,
                required: false,
            },
        ],
        []
    );

    // Check if form has unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    // Detect changes in specific step
    const detectStepChanges = useCallback(
        (stepIndex: number, data: Partial<Organization>): boolean => {
            const stepFields = [
                ['name', 'business_type'], // Basic info fields
                [
                    'website',
                    'phone',
                    'email',
                    'contact_person',
                    'address',
                    'city',
                    'state',
                    'zipCode',
                    'latitude',
                    'longitude',
                ], // Contact details
                [
                    'priorityId',
                    'segmentId',
                    'distributorId',
                    'accountManager',
                    'revenue',
                    'notes',
                ], // Business details
            ];

            const fieldsToCheck = stepFields[stepIndex] || [];
            return fieldsToCheck.some(
                field =>
                    data[field as keyof Organization] !==
                    originalData[field as keyof Organization]
            );
        },
        [originalData]
    );

    // Validate current step
    const validateStep = useCallback(
        async (
            stepIndex: number,
            data: Partial<Organization>
        ): Promise<StepValidationResult> => {
            const step = steps[stepIndex];
            if (!step.validate) {
                return { isValid: true, errors: [], warnings: [] };
            }
            return step.validate(data);
        },
        [steps]
    );

    // Update step validation state
    const updateStepState = useCallback(
        async (stepIndex: number, data: Partial<Organization>) => {
            const validation = await validateStep(stepIndex, data);
            const hasChanges = detectStepChanges(stepIndex, data);

            setStepStates(prev => ({
                ...prev,
                [stepIndex]: {
                    completed:
                        validation.isValid && steps[stepIndex].required
                            ? true
                            : prev[stepIndex].completed,
                    hasErrors: validation.errors.length > 0,
                    isValid: validation.isValid,
                    errorCount: validation.errors.length,
                    warningCount: validation.warnings.length,
                    hasChanges,
                },
            }));

            return validation;
        },
        [validateStep, steps, detectStepChanges]
    );

    // Handle form data change
    const handleFormDataChange = useCallback(
        async (newData: Partial<Organization>) => {
            setFormData(newData);
            await updateStepState(activeStep, newData);
        },
        [activeStep, updateStepState]
    );

    // Navigate to next step
    const handleNext = useCallback(async () => {
        const validation = await validateStep(activeStep, formData);

        if (validation.isValid || !steps[activeStep].required) {
            setStepStates(prev => ({
                ...prev,
                [activeStep]: { ...prev[activeStep], completed: true },
            }));

            if (activeStep < steps.length - 1) {
                setActiveStep(prev => prev + 1);
            }
        } else {
            // Show validation errors
            const errors: Record<string, string> = {};
            validation.errors.forEach(error => {
                errors[error.field] = error.message;
            });
            setValidationErrors(errors);

            notify('Please fix the errors before proceeding', {
                type: 'warning',
            });
        }
    }, [activeStep, formData, validateStep, steps, notify]);

    // Navigate to previous step
    const handleBack = useCallback(() => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    }, [activeStep]);

    // Jump to specific step with unsaved changes check
    const handleStepClick = useCallback(
        (stepIndex: number) => {
            const currentStepHasChanges = stepStates[activeStep].hasChanges;

            if (currentStepHasChanges && stepIndex !== activeStep) {
                setPendingNavigation(stepIndex);
                setShowUnsavedChangesDialog(true);
            } else if (
                stepIndex <= activeStep ||
                stepStates[activeStep].isValid
            ) {
                setActiveStep(stepIndex);
            }
        },
        [activeStep, stepStates]
    );

    // Handle unsaved changes dialog
    const handleUnsavedChangesConfirm = useCallback(() => {
        if (pendingNavigation !== null) {
            setActiveStep(pendingNavigation);
            setPendingNavigation(null);
        }
        setShowUnsavedChangesDialog(false);
    }, [pendingNavigation]);

    const handleUnsavedChangesCancel = useCallback(() => {
        setPendingNavigation(null);
        setShowUnsavedChangesDialog(false);
    }, []);

    // Reset form to original values
    const handleResetForm = useCallback(() => {
        setFormData(originalData);
        setValidationErrors({});
        notify('Form reset to original values', { type: 'info' });
    }, [originalData, notify]);

    // Calculate overall progress
    const progressPercentage = useMemo(() => {
        const completedSteps = Object.values(stepStates).filter(
            state => state.completed
        ).length;
        return (completedSteps / steps.length) * 100;
    }, [stepStates, steps.length]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
        return stepStates[0].isValid && !isSubmitting && hasUnsavedChanges;
    }, [stepStates, isSubmitting, hasUnsavedChanges]);

    // Transform form data for submission
    const transformFormData = useCallback(
        (values: Partial<Organization>) => {
            // Add https:// before website if not present
            if (values.website && !values.website.startsWith('http')) {
                values.website = `https://${values.website}`;
            }

            // Update modification tracking
            return {
                ...values,
                modifiedBy: identity?.id,
                modifiedAt: new Date().toISOString(),
            };
        },
        [identity]
    );

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        setIsSubmitting(true);
        try {
            // Final validation of all steps
            for (let i = 0; i < steps.length; i++) {
                const validation = await validateStep(i, formData);
                if (!validation.isValid && steps[i].required) {
                    throw new Error(`Step ${i + 1} has validation errors`);
                }
            }

            // Transform and submit data
            const transformedData = transformFormData(formData);

            notify('Organization updated successfully!', { type: 'success' });

            if (redirectOnSave && !isModal) {
                redirect(redirectOnSave, 'organizations', transformedData.id);
            } else if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Form submission error:', error);
            notify('Failed to update organization. Please try again.', {
                type: 'error',
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [
        formData,
        steps,
        validateStep,
        transformFormData,
        notify,
        redirect,
        redirectOnSave,
        isModal,
        onClose,
    ]);

    // Get step status icon
    const getStepIcon = useCallback(
        (stepIndex: number) => {
            const state = stepStates[stepIndex];
            if (state.completed) {
                return <CheckIcon className="h-5 w-5 text-green-600" />;
            }
            if (state.hasErrors) {
                return <ErrorIcon className="h-5 w-5 text-red-600" />;
            }
            if (state.warningCount > 0) {
                return <WarningIcon className="h-5 w-5 text-yellow-600" />;
            }
            return (
                <span className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center font-medium">
                    {stepIndex + 1}
                </span>
            );
        },
        [stepStates]
    );

    // Render step content
    const renderStepContent = useCallback(
        (stepIndex: number) => {
            const step = steps[stepIndex];
            const StepComponent = step.component;

            return (
                <StepComponent
                    formData={formData}
                    onDataChange={handleFormDataChange}
                    validationErrors={validationErrors}
                    isMobile={isMobile}
                />
            );
        },
        [steps, formData, handleFormDataChange, validationErrors, isMobile]
    );

    if (!record) {
        return (
            <Box className="p-6 text-center">
                <Typography>Loading organization...</Typography>
            </Box>
        );
    }

    return (
        <Edit actions={false} redirect={false} transform={transformFormData}>
            <Form>
                <Paper
                    elevation={isModal ? 0 : 2}
                    className={`p-4 sm:p-6 max-w-full md:max-w-3xl relative ${isModal ? 'mx-0' : 'mx-auto'}`}
                >
                    {/* Header */}
                    <Box className="flex items-center justify-between mb-6">
                        <Box>
                            <Typography variant="h5" component="h1">
                                Edit Organization
                            </Typography>
                            <Typography
                                variant="body2"
                                className="text-gray-600"
                            >
                                {record.name}
                            </Typography>
                        </Box>

                        <Box className="flex gap-2">
                            {hasUnsavedChanges && (
                                <Tooltip title="Reset to original values">
                                    <IconButton
                                        onClick={handleResetForm}
                                        className="min-w-11 min-h-11"
                                    >
                                        <RestoreIcon className="h-5 w-5" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {onClose && (
                                <Tooltip title="Close">
                                    <IconButton
                                        onClick={onClose}
                                        className="min-w-11 min-h-11"
                                    >
                                        <CloseIcon className="h-5 w-5" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>

                    {/* Unsaved Changes Warning */}
                    {hasUnsavedChanges && (
                        <Alert variant="warning" className="mb-4">
                            <Typography variant="body2">
                                You have unsaved changes. Make sure to save
                                before leaving this page.
                            </Typography>
                        </Alert>
                    )}

                    {/* Progress Bar */}
                    <Box className="mb-6">
                        <Box className="flex justify-between mb-2">
                            <Typography variant="body2" className="text-gray-600">
                                Progress: {Math.round(progressPercentage)}%
                            </Typography>
                            <Typography variant="body2" className="text-gray-600">
                                Step {activeStep + 1} of {steps.length}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            className="h-2 rounded-full"
                        />
                    </Box>

                    {/* Custom Stepper */}
                    <div className={`mb-6 ${isMobile ? 'space-y-4' : ''}`}>
                        {isMobile ? (
                            // Vertical Stepper for Mobile
                            <div className="space-y-4">
                                {steps.map((step, index) => {
                                    const state = stepStates[index];
                                    const isActive = index === activeStep;
                                    return (
                                        <div key={step.id} className="border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => handleStepClick(index)}
                                                className={`w-full p-4 text-left transition-colors ${
                                                    isActive
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`}>
                                                        {getStepIcon(index)}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <Typography variant="subtitle2" className={isActive ? 'text-blue-900' : ''}>
                                                            {step.icon} {step.label}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-600">
                                                            {step.description}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </button>
                                            {isActive && (
                                                <div className="border-t border-gray-200 p-4 bg-white">
                                                    {renderStepContent(index)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Horizontal Stepper for Desktop
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => {
                                    const state = stepStates[index];
                                    const isActive = index === activeStep;
                                    const isCompleted = state.completed;
                                    const canClick = index <= activeStep || state.isValid;
                                    
                                    return (
                                        <React.Fragment key={step.id}>
                                            <div className="flex-1 max-w-xs">
                                                <button
                                                    onClick={() => canClick && handleStepClick(index)}
                                                    disabled={!canClick}
                                                    className={`w-full text-left p-3 rounded-lg transition-all ${
                                                        canClick ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed opacity-60'
                                                    } ${
                                                        isActive
                                                            ? 'bg-blue-50 border-2 border-blue-200'
                                                            : isCompleted
                                                              ? 'bg-green-50 border border-green-200'
                                                              : 'border border-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className={`flex-shrink-0 ${
                                                            isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : ''
                                                        }`}>
                                                            {getStepIcon(index)}
                                                        </div>
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            className={`${
                                                                isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : ''
                                                            }`}
                                                        >
                                                            {step.icon} {step.label}
                                                        </Typography>
                                                    </div>
                                                    <Typography variant="caption" className="text-gray-600 block mb-2">
                                                        {step.description}
                                                    </Typography>
                                                    <div className="flex flex-wrap gap-1">
                                                        {state.hasChanges && (
                                                            <Chip
                                                                label="Modified"
                                                                size="small"
                                                                className="bg-blue-100 text-blue-800 border border-blue-200"
                                                            />
                                                        )}
                                                        {state.errorCount > 0 && (
                                                            <Chip
                                                                label={`${state.errorCount} error${state.errorCount > 1 ? 's' : ''}`}
                                                                size="small"
                                                                className="bg-red-100 text-red-800 border border-red-200"
                                                            />
                                                        )}
                                                        {state.warningCount > 0 && (
                                                            <Chip
                                                                label={`${state.warningCount} warning${state.warningCount > 1 ? 's' : ''}`}
                                                                size="small"
                                                                className="bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                            />
                                                        )}
                                                    </div>
                                                </button>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className="flex-shrink-0 mx-4">
                                                    <ArrowRightIcon className={`h-5 w-5 ${
                                                        index < activeStep ? 'text-green-600' : 'text-gray-400'
                                                    }`} />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Desktop Step Content */}
                    {!isMobile && (
                        <Box className="mt-6 min-h-96">
                            {renderStepContent(activeStep)}
                        </Box>
                    )}

                    {/* Error Summary */}
                    {Object.keys(validationErrors).length > 0 && (
                        <Alert
                            variant="error"
                            className="mt-4"
                            action={
                                <IconButton
                                    onClick={() => setValidationErrors({})}
                                    className="text-red-600"
                                >
                                    <CloseIcon className="h-4 w-4" />
                                </IconButton>
                            }
                        >
                            <Typography variant="body2" className="font-medium">
                                Please fix the following errors:
                            </Typography>
                            <ul className="mt-2 mb-0 pl-4 list-disc">
                                {Object.entries(validationErrors).map(
                                    ([field, error]) => (
                                        <li key={field}>
                                            <Typography variant="body2">
                                                {field}: {error}
                                            </Typography>
                                        </li>
                                    )
                                )}
                            </ul>
                        </Alert>
                    )}

                    {/* Navigation */}
                    <Box className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
                        <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            startIcon={<ArrowBackIcon className="h-4 w-4" />}
                            className="min-h-11"
                        >
                            Back
                        </Button>

                        <Box className="flex gap-4">
                            {activeStep === steps.length - 1 ? (
                                <FormDataConsumer>
                                    {({ formData: currentFormData }) => (
                                        <SaveButton
                                            label="Save Changes"
                                            icon={<SaveIcon className="h-4 w-4" />}
                                            disabled={!canSubmit}
                                            variant="contained"
                                            className="min-h-11 px-6"
                                            transform={transformFormData}
                                        />
                                    )}
                                </FormDataConsumer>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    variant="contained"
                                    endIcon={<ArrowForwardIcon className="h-4 w-4" />}
                                    className="min-h-11"
                                >
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Paper>

                {/* Unsaved Changes Dialog */}
                <Dialog
                    open={showUnsavedChangesDialog}
                    onClose={handleUnsavedChangesCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Unsaved Changes</DialogTitle>
                    <DialogContent>
                        <Typography>
                            You have unsaved changes in the current step. Do you
                            want to continue without saving? Your changes will
                            be lost.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleUnsavedChangesCancel}>
                            Stay Here
                        </Button>
                        <Button
                            onClick={handleUnsavedChangesConfirm}
                            color="warning"
                            variant="contained"
                        >
                            Continue Without Saving
                        </Button>
                    </DialogActions>
                </Dialog>
            </Form>
        </Edit>
    );
};
