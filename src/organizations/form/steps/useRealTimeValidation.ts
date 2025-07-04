import { useCallback, useEffect, useState, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { useDataProvider } from 'react-admin';
import { Organization } from '../../../types';
import {
    StepValidationResult,
    ValidationError,
    ValidationWarning,
} from './types';
import {
    validateBasicInfo,
    validateContactDetails,
    validateBusinessDetails,
} from './validation';

interface RealTimeValidationOptions {
    debounceMs?: number;
    enableDuplicateCheck?: boolean;
    excludeId?: number; // For edit forms, exclude current record from duplicate check
}

interface RealTimeValidationState {
    isValidating: boolean;
    validationResults: Record<string, StepValidationResult>;
    globalValidation: StepValidationResult;
    duplicateCheckResults: Record<string, boolean>;
}

/**
 * Hook for real-time form validation with duplicate checking
 * Features:
 * - Debounced validation to avoid excessive API calls
 * - Real-time duplicate organization detection
 * - Field-level and form-level validation
 * - Async validation state management
 */
export const useRealTimeValidation = (
    formData: Partial<Organization>,
    options: RealTimeValidationOptions = {}
) => {
    const {
        debounceMs = 300,
        enableDuplicateCheck = true,
        excludeId,
    } = options;

    const dataProvider = useDataProvider();
    const abortControllerRef = useRef<AbortController | null>(null);

    // Debounced form data to reduce validation frequency
    const [debouncedFormData] = useDebounce(formData, debounceMs);

    // Validation state
    const [validationState, setValidationState] =
        useState<RealTimeValidationState>({
            isValidating: false,
            validationResults: {},
            globalValidation: { isValid: true, errors: [], warnings: [] },
            duplicateCheckResults: {},
        });

    // Real-time duplicate organization check
    const checkDuplicate = useCallback(
        async (name: string): Promise<boolean> => {
            if (!name || name.trim().length < 2) {
                return true; // No duplicate check for short names
            }

            try {
                // Cancel previous request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // Create new abort controller
                abortControllerRef.current = new AbortController();

                const filter: any = {
                    name: { ilike: `%${name.trim()}%` },
                };

                // Exclude current record in edit mode
                if (excludeId) {
                    filter.id = { neq: excludeId };
                }

                const result = await dataProvider.getList('organizations', {
                    pagination: { page: 1, perPage: 1 },
                    sort: { field: 'id', order: 'DESC' },
                    filter,
                    signal: abortControllerRef.current.signal,
                });

                // Check for exact name match (case-insensitive)
                const exactMatch = result.data.find(
                    org =>
                        org.name.toLowerCase().trim() ===
                        name.toLowerCase().trim()
                );

                return !exactMatch; // Return true if no duplicate found
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    // Request was cancelled, ignore
                    return true;
                }
                console.error('Duplicate check error:', error);
                // On error, assume no duplicate to avoid blocking user
                return true;
            }
        },
        [dataProvider, excludeId]
    );

    // Enhanced duplicate validation for business context
    const checkBusinessDuplicate = useCallback(
        async (
            name: string,
            address?: string,
            phone?: string
        ): Promise<{ isDuplicate: boolean; matchReason?: string }> => {
            if (!name || name.trim().length < 2) {
                return { isDuplicate: false };
            }

            try {
                // Check for name + address match
                if (address && address.trim().length > 0) {
                    const addressFilter: any = {
                        name: { ilike: `%${name.trim()}%` },
                        address: { ilike: `%${address.trim()}%` },
                    };

                    if (excludeId) {
                        addressFilter.id = { neq: excludeId };
                    }

                    const addressResult = await dataProvider.getList(
                        'organizations',
                        {
                            pagination: { page: 1, perPage: 1 },
                            sort: { field: 'id', order: 'DESC' },
                            filter: addressFilter,
                        }
                    );

                    if (addressResult.data.length > 0) {
                        return {
                            isDuplicate: true,
                            matchReason: 'Similar name and address found',
                        };
                    }
                }

                // Check for name + phone match
                if (phone && phone.trim().length > 0) {
                    const phoneDigits = phone.replace(/\D/g, '');
                    if (phoneDigits.length >= 10) {
                        const phoneFilter: any = {
                            name: { ilike: `%${name.trim()}%` },
                            phone: { ilike: `%${phoneDigits.slice(-10)}%` },
                        };

                        if (excludeId) {
                            phoneFilter.id = { neq: excludeId };
                        }

                        const phoneResult = await dataProvider.getList(
                            'organizations',
                            {
                                pagination: { page: 1, perPage: 1 },
                                sort: { field: 'id', order: 'DESC' },
                                filter: phoneFilter,
                            }
                        );

                        if (phoneResult.data.length > 0) {
                            return {
                                isDuplicate: true,
                                matchReason:
                                    'Similar name and phone number found',
                            };
                        }
                    }
                }

                return { isDuplicate: false };
            } catch (error: any) {
                if (error.name === 'AbortError') {
                    return { isDuplicate: false };
                }
                console.error('Business duplicate check error:', error);
                return { isDuplicate: false };
            }
        },
        [dataProvider, excludeId]
    );

    // Validate individual step
    const validateStep = useCallback(
        async (
            stepName: string,
            data: Partial<Organization>
        ): Promise<StepValidationResult> => {
            const validationFunctions = {
                basic: validateBasicInfo,
                contact: validateContactDetails,
                business: validateBusinessDetails,
            };

            const validateFn =
                validationFunctions[
                    stepName as keyof typeof validationFunctions
                ];
            if (!validateFn) {
                return { isValid: true, errors: [], warnings: [] };
            }

            const result = await validateFn(data);

            // Add duplicate checking for basic info step
            if (stepName === 'basic' && enableDuplicateCheck && data.name) {
                const isDuplicateUnique = await checkDuplicate(data.name);
                if (!isDuplicateUnique) {
                    result.errors.push({
                        field: 'name',
                        message:
                            'An organization with this name already exists',
                        severity: 'error',
                    });
                    result.isValid = false;
                }

                // Advanced business duplicate check
                const businessDuplicateResult = await checkBusinessDuplicate(
                    data.name,
                    data.address,
                    data.phone
                );

                if (
                    businessDuplicateResult.isDuplicate &&
                    businessDuplicateResult.matchReason
                ) {
                    result.warnings.push({
                        field: 'name',
                        message: businessDuplicateResult.matchReason,
                        severity: 'warning',
                    });
                }
            }

            return result;
        },
        [enableDuplicateCheck, checkDuplicate, checkBusinessDuplicate]
    );

    // Real-time validation effect
    useEffect(() => {
        let isCancelled = false;

        const runValidation = async () => {
            if (!debouncedFormData) return;

            setValidationState(prev => ({ ...prev, isValidating: true }));

            try {
                // Validate all steps
                const [basicResult, contactResult, businessResult] =
                    await Promise.all([
                        validateStep('basic', debouncedFormData),
                        validateStep('contact', debouncedFormData),
                        validateStep('business', debouncedFormData),
                    ]);

                if (!isCancelled) {
                    const stepResults = {
                        basic: basicResult,
                        contact: contactResult,
                        business: businessResult,
                    };

                    // Combine all validation results for global state
                    const allErrors: ValidationError[] = [];
                    const allWarnings: ValidationWarning[] = [];

                    Object.values(stepResults).forEach(result => {
                        allErrors.push(...result.errors);
                        allWarnings.push(...result.warnings);
                    });

                    const globalValidation: StepValidationResult = {
                        isValid: allErrors.length === 0,
                        errors: allErrors,
                        warnings: allWarnings,
                    };

                    setValidationState(prev => ({
                        ...prev,
                        isValidating: false,
                        validationResults: stepResults,
                        globalValidation,
                    }));
                }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Real-time validation error:', error);
                    setValidationState(prev => ({
                        ...prev,
                        isValidating: false,
                    }));
                }
            }
        };

        runValidation();

        return () => {
            isCancelled = true;
        };
    }, [debouncedFormData, validateStep]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Get validation result for specific step
    const getStepValidation = useCallback(
        (stepName: string): StepValidationResult => {
            return (
                validationState.validationResults[stepName] || {
                    isValid: true,
                    errors: [],
                    warnings: [],
                }
            );
        },
        [validationState.validationResults]
    );

    // Get validation errors for specific field
    const getFieldErrors = useCallback(
        (fieldName: string): ValidationError[] => {
            return validationState.globalValidation.errors.filter(
                error => error.field === fieldName
            );
        },
        [validationState.globalValidation.errors]
    );

    // Get validation warnings for specific field
    const getFieldWarnings = useCallback(
        (fieldName: string): ValidationWarning[] => {
            return validationState.globalValidation.warnings.filter(
                warning => warning.field === fieldName
            );
        },
        [validationState.globalValidation.warnings]
    );

    // Check if field has errors
    const hasFieldErrors = useCallback(
        (fieldName: string): boolean => {
            return getFieldErrors(fieldName).length > 0;
        },
        [getFieldErrors]
    );

    // Check if field has warnings
    const hasFieldWarnings = useCallback(
        (fieldName: string): boolean => {
            return getFieldWarnings(fieldName).length > 0;
        },
        [getFieldWarnings]
    );

    // Manual validation trigger for specific step
    const validateStepManually = useCallback(
        async (stepName: string): Promise<StepValidationResult> => {
            const result = await validateStep(stepName, formData);

            setValidationState(prev => ({
                ...prev,
                validationResults: {
                    ...prev.validationResults,
                    [stepName]: result,
                },
            }));

            return result;
        },
        [validateStep, formData]
    );

    return {
        // Validation state
        isValidating: validationState.isValidating,
        globalValidation: validationState.globalValidation,

        // Step-specific validation
        getStepValidation,
        validateStepManually,

        // Field-specific validation
        getFieldErrors,
        getFieldWarnings,
        hasFieldErrors,
        hasFieldWarnings,

        // Duplicate checking
        checkDuplicate,
        checkBusinessDuplicate,

        // Form-level validation state
        isFormValid: validationState.globalValidation.isValid,
        hasErrors: validationState.globalValidation.errors.length > 0,
        hasWarnings: validationState.globalValidation.warnings.length > 0,
        errorCount: validationState.globalValidation.errors.length,
        warningCount: validationState.globalValidation.warnings.length,
    };
};
