import { useState, useCallback, useMemo, useEffect } from 'react';

export interface FormStep<T = any> {
    id: string;
    label: string;
    description: string;
    icon: string;
    validate?: (data: T) => Promise<StepValidationResult>;
    required: boolean;
}

export interface StepValidationResult {
    isValid: boolean;
    errors: { field: string; message: string; severity: 'error' }[];
    warnings: { field: string; message: string; severity: 'warning' }[];
}

export interface StepState {
    completed: boolean;
    hasErrors: boolean;
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    hasChanges: boolean;
}

export interface UseMultiStepFormProps<T> {
    steps: FormStep<T>[];
    initialData: T;
    onSave?: (data: T) => Promise<void>;
    persistKey?: string;
    enablePersistence?: boolean;
}

export interface UseMultiStepFormReturn<T> {
    // Current state
    activeStep: number;
    formData: T;
    originalData: T;
    stepStates: Record<number, StepState>;
    hasUnsavedChanges: boolean;
    canSubmit: boolean;
    validationErrors: Record<string, string>;
    
    // Actions
    goToStep: (step: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    updateFormData: (data: Partial<T>) => void;
    validateStep: (stepIndex: number) => Promise<boolean>;
    validateAllSteps: () => Promise<boolean>;
    submitForm: () => Promise<void>;
    resetForm: () => void;
    restorePersistedData: () => void;
    
    // Utilities
    getStepProgress: () => number;
    getOverallProgress: () => number;
    detectStepChanges: (stepIndex: number, data: T) => boolean;
}

/**
 * Comprehensive hook for managing multi-step forms
 * Extracted from MultiStepOrganizationEdit for reuse across the app
 */
export function useMultiStepForm<T extends Record<string, any>>({
    steps,
    initialData,
    onSave,
    persistKey,
    enablePersistence = true,
}: UseMultiStepFormProps<T>): UseMultiStepFormReturn<T> {
    // Core state
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<T>(initialData);
    const [originalData] = useState<T>(initialData);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    // Step states initialization
    const [stepStates, setStepStates] = useState<Record<number, StepState>>(() => {
        const initialStates: Record<number, StepState> = {};
        steps.forEach((_, index) => {
            initialStates[index] = {
                completed: false,
                hasErrors: false,
                isValid: true,
                errorCount: 0,
                warningCount: 0,
                hasChanges: false,
            };
        });
        return initialStates;
    });

    // Persistence key for localStorage
    const storageKey = persistKey ? `multiStepForm_${persistKey}` : null;

    // Check if form has unsaved changes
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    }, [formData, originalData]);

    // Check if form can be submitted
    const canSubmit = useMemo(() => {
        return Object.values(stepStates).every(state => state.isValid) &&
               steps.filter(step => step.required).every((_, index) => stepStates[index]?.completed);
    }, [stepStates, steps]);

    // Persist form data to localStorage
    const persistFormData = useCallback(() => {
        if (!enablePersistence || !storageKey) return;
        
        try {
            const persistData = {
                formData,
                activeStep,
                stepStates,
                timestamp: Date.now(),
            };
            localStorage.setItem(storageKey, JSON.stringify(persistData));
        } catch (error) {
            console.warn('Failed to persist form data:', error);
        }
    }, [formData, activeStep, stepStates, storageKey, enablePersistence]);

    // Restore persisted form data
    const restorePersistedData = useCallback(() => {
        if (!enablePersistence || !storageKey) return;
        
        try {
            const persistedData = localStorage.getItem(storageKey);
            if (persistedData) {
                const { formData: savedData, activeStep: savedStep, stepStates: savedStates } = JSON.parse(persistedData);
                setFormData(savedData);
                setActiveStep(savedStep);
                setStepStates(savedStates);
            }
        } catch (error) {
            console.warn('Failed to restore form data:', error);
        }
    }, [storageKey, enablePersistence]);

    // Detect changes in specific step
    const detectStepChanges = useCallback((stepIndex: number, data: T): boolean => {
        // Define step fields mapping (this would be configurable in a real implementation)
        const stepFields = [
            ['name', 'business_type'], // Basic info fields
            ['website', 'phone', 'email', 'contact_person', 'address', 'city', 'state', 'zipCode'], // Contact details
            ['priorityId', 'segmentId', 'distributorId', 'accountManager', 'revenue', 'notes'], // Business details
        ];

        const fieldsToCheck = stepFields[stepIndex] || [];
        return fieldsToCheck.some(field => data[field] !== originalData[field]);
    }, [originalData]);

    // Validate specific step
    const validateStep = useCallback(async (stepIndex: number): Promise<boolean> => {
        const step = steps[stepIndex];
        if (!step.validate) {
            // No validation function, consider valid
            setStepStates(prev => ({
                ...prev,
                [stepIndex]: {
                    ...prev[stepIndex],
                    isValid: true,
                    hasErrors: false,
                    errorCount: 0,
                    warningCount: 0,
                }
            }));
            return true;
        }

        try {
            const result = await step.validate(formData);
            const hasChanges = detectStepChanges(stepIndex, formData);
            
            setStepStates(prev => ({
                ...prev,
                [stepIndex]: {
                    ...prev[stepIndex],
                    isValid: result.isValid,
                    hasErrors: result.errors.length > 0,
                    errorCount: result.errors.length,
                    warningCount: result.warnings.length,
                    hasChanges,
                    completed: result.isValid && hasChanges,
                }
            }));

            // Update validation errors
            const stepErrors: Record<string, string> = {};
            result.errors.forEach(error => {
                stepErrors[error.field] = error.message;
            });
            setValidationErrors(prev => ({ ...prev, ...stepErrors }));

            return result.isValid;
        } catch (error) {
            console.error('Step validation failed:', error);
            return false;
        }
    }, [steps, formData, detectStepChanges]);

    // Validate all steps
    const validateAllSteps = useCallback(async (): Promise<boolean> => {
        const validationPromises = steps.map((_, index) => validateStep(index));
        const results = await Promise.all(validationPromises);
        return results.every(result => result);
    }, [steps, validateStep]);

    // Navigation functions
    const goToStep = useCallback((step: number) => {
        if (step >= 0 && step < steps.length) {
            setActiveStep(step);
        }
    }, [steps.length]);

    const nextStep = useCallback(() => {
        if (activeStep < steps.length - 1) {
            setActiveStep(prev => prev + 1);
        }
    }, [activeStep, steps.length]);

    const previousStep = useCallback(() => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    }, [activeStep]);

    // Update form data
    const updateFormData = useCallback((newData: Partial<T>) => {
        setFormData(prev => ({ ...prev, ...newData }));
    }, []);

    // Submit form
    const submitForm = useCallback(async () => {
        if (!canSubmit) return;
        
        const isValid = await validateAllSteps();
        if (!isValid) return;

        try {
            await onSave?.(formData);
            
            // Clear persisted data on successful save
            if (storageKey) {
                localStorage.removeItem(storageKey);
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            throw error;
        }
    }, [canSubmit, validateAllSteps, onSave, formData, storageKey]);

    // Reset form to original state
    const resetForm = useCallback(() => {
        setFormData(originalData);
        setActiveStep(0);
        setValidationErrors({});
        setStepStates(prev => {
            const resetStates: Record<number, StepState> = {};
            Object.keys(prev).forEach(key => {
                resetStates[parseInt(key)] = {
                    completed: false,
                    hasErrors: false,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    hasChanges: false,
                };
            });
            return resetStates;
        });
        
        // Clear persisted data
        if (storageKey) {
            localStorage.removeItem(storageKey);
        }
    }, [originalData, storageKey]);

    // Progress calculations
    const getStepProgress = useCallback(() => {
        const completedSteps = Object.values(stepStates).filter(state => state.completed).length;
        return (completedSteps / steps.length) * 100;
    }, [stepStates, steps.length]);

    const getOverallProgress = useCallback(() => {
        return ((activeStep + 1) / steps.length) * 100;
    }, [activeStep, steps.length]);

    // Auto-persist when form data changes
    useEffect(() => {
        if (hasUnsavedChanges) {
            persistFormData();
        }
    }, [formData, activeStep, stepStates, hasUnsavedChanges, persistFormData]);

    // Validate current step when form data changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            validateStep(activeStep);
        }, 300); // Debounce validation

        return () => clearTimeout(timeoutId);
    }, [formData, activeStep, validateStep]);

    return {
        // State
        activeStep,
        formData,
        originalData,
        stepStates,
        hasUnsavedChanges,
        canSubmit,
        validationErrors,
        
        // Actions
        goToStep,
        nextStep,
        previousStep,
        updateFormData,
        validateStep,
        validateAllSteps,
        submitForm,
        resetForm,
        restorePersistedData,
        
        // Utilities
        getStepProgress,
        getOverallProgress,
        detectStepChanges,
    };
}