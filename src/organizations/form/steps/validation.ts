import { Organization } from '../../../types';
import { StepValidationResult, ValidationError, ValidationWarning } from './types';

// URL validation regex
const URL_REGEX = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

// Email validation regex
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// Phone validation regex
const PHONE_REGEX = /^[\d\s\-\.\(\)\+]+$/;

// ZIP code validation regex
const ZIP_REGEX = /^\d{5}(-\d{4})?$/;

/**
 * Validate basic information step
 */
export async function validateBasicInfo(data: Partial<Organization>): Promise<StepValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required: Organization name
    if (!data.name || data.name.trim().length === 0) {
        errors.push({
            field: 'name',
            message: 'Organization name is required',
            severity: 'error'
        });
    } else if (data.name.trim().length < 2) {
        errors.push({
            field: 'name',
            message: 'Organization name must be at least 2 characters',
            severity: 'error'
        });
    } else if (data.name.trim().length > 100) {
        errors.push({
            field: 'name',
            message: 'Organization name must be less than 100 characters',
            severity: 'error'
        });
    }

    // Warning: Very short names
    if (data.name && data.name.trim().length > 0 && data.name.trim().length < 5) {
        warnings.push({
            field: 'name',
            message: 'Organization name is quite short. Consider using the full name.',
            severity: 'warning'
        });
    }

    // Business type validation
    if (data.business_type && !['restaurant', 'grocery', 'distributor', 'other'].includes(data.business_type)) {
        warnings.push({
            field: 'business_type',
            message: 'Uncommon business type. Please verify this is correct.',
            severity: 'warning'
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate contact details step
 */
export async function validateContactDetails(data: Partial<Organization>): Promise<StepValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Website validation
    if (data.website && data.website.trim().length > 0) {
        if (!URL_REGEX.test(data.website.trim())) {
            errors.push({
                field: 'website',
                message: 'Please enter a valid website URL',
                severity: 'error'
            });
        }
    }

    // Phone validation
    if (data.phone && data.phone.trim().length > 0) {
        if (!PHONE_REGEX.test(data.phone.trim())) {
            errors.push({
                field: 'phone',
                message: 'Please enter a valid phone number',
                severity: 'error'
            });
        } else if (data.phone.replace(/\D/g, '').length < 10) {
            errors.push({
                field: 'phone',
                message: 'Phone number must have at least 10 digits',
                severity: 'error'
            });
        }
    }

    // Email validation
    if (data.email && data.email.trim().length > 0) {
        if (!EMAIL_REGEX.test(data.email.trim())) {
            errors.push({
                field: 'email',
                message: 'Please enter a valid email address',
                severity: 'error'
            });
        }
    }

    // Contact person validation
    if (data.contact_person && data.contact_person.trim().length > 0) {
        if (data.contact_person.trim().length < 2) {
            errors.push({
                field: 'contact_person',
                message: 'Contact person name must be at least 2 characters',
                severity: 'error'
            });
        }
    }

    // Address validation
    if (data.zipCode && data.zipCode.trim().length > 0) {
        if (!ZIP_REGEX.test(data.zipCode.trim())) {
            errors.push({
                field: 'zipCode',
                message: 'Please enter a valid ZIP code (12345 or 12345-6789)',
                severity: 'error'
            });
        }
    }

    // Warnings for incomplete contact info
    if (!data.phone && !data.email) {
        warnings.push({
            field: 'contact',
            message: 'Consider adding either a phone number or email for better communication',
            severity: 'warning'
        });
    }

    if (data.address && !data.city) {
        warnings.push({
            field: 'city',
            message: 'City is recommended when address is provided',
            severity: 'warning'
        });
    }

    if (data.city && !data.state) {
        warnings.push({
            field: 'state',
            message: 'State is recommended when city is provided',
            severity: 'warning'
        });
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate business details step
 */
export async function validateBusinessDetails(data: Partial<Organization>): Promise<StepValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Account manager email validation
    if (data.accountManager && data.accountManager.trim().length > 0) {
        if (!EMAIL_REGEX.test(data.accountManager.trim())) {
            errors.push({
                field: 'accountManager',
                message: 'Account manager must be a valid email address',
                severity: 'error'
            });
        }
    }

    // Revenue validation
    if (data.revenue !== undefined && data.revenue !== null) {
        if (data.revenue < 0) {
            errors.push({
                field: 'revenue',
                message: 'Revenue cannot be negative',
                severity: 'error'
            });
        } else if (data.revenue > 1000000000) {
            warnings.push({
                field: 'revenue',
                message: 'Revenue amount seems unusually high. Please verify.',
                severity: 'warning'
            });
        }
    }

    // Notes validation
    if (data.notes && data.notes.length > 500) {
        errors.push({
            field: 'notes',
            message: 'Notes must be less than 500 characters',
            severity: 'error'
        });
    }

    // Business context warnings
    if (!data.priorityId) {
        warnings.push({
            field: 'priorityId',
            message: 'Setting a priority helps with organization management',
            severity: 'warning'
        });
    }

    if (!data.segmentId) {
        warnings.push({
            field: 'segmentId',
            message: 'Business segment helps with categorization and reporting',
            severity: 'warning'
        });
    }

    // GPS coordinates validation
    if (data.latitude !== undefined && data.latitude !== null) {
        if (data.latitude < -90 || data.latitude > 90) {
            errors.push({
                field: 'latitude',
                message: 'Latitude must be between -90 and 90 degrees',
                severity: 'error'
            });
        }
    }

    if (data.longitude !== undefined && data.longitude !== null) {
        if (data.longitude < -180 || data.longitude > 180) {
            errors.push({
                field: 'longitude',
                message: 'Longitude must be between -180 and 180 degrees',
                severity: 'error'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate duplicate organization name
 * This would typically make an API call to check for duplicates
 */
export async function validateDuplicateOrganization(name: string): Promise<boolean> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock duplicate check - in real app, this would query the database
    const mockExistingNames = [
        'acme corporation',
        'global foods inc',
        'metro restaurant group',
        'sunshine grocery',
    ];
    
    return !mockExistingNames.includes(name.toLowerCase().trim());
}

/**
 * Comprehensive form validation for final submission
 */
export async function validateCompleteForm(data: Partial<Organization>): Promise<StepValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run all step validations
    const basicValidation = await validateBasicInfo(data);
    const contactValidation = await validateContactDetails(data);
    const businessValidation = await validateBusinessDetails(data);

    // Combine all validation results
    errors.push(...basicValidation.errors);
    errors.push(...contactValidation.errors);
    errors.push(...businessValidation.errors);

    warnings.push(...basicValidation.warnings);
    warnings.push(...contactValidation.warnings);
    warnings.push(...businessValidation.warnings);

    // Check for duplicate organization
    if (data.name && data.name.trim().length > 0) {
        const isUnique = await validateDuplicateOrganization(data.name);
        if (!isUnique) {
            errors.push({
                field: 'name',
                message: 'An organization with this name already exists',
                severity: 'error'
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}