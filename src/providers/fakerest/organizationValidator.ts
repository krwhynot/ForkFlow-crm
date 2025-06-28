import { Identifier } from 'react-admin';
import { Organization, Setting } from '../../types';
import { OrganizationValidationRules } from '../types';

// Organization validation rules
export const ORGANIZATION_VALIDATION_RULES: OrganizationValidationRules = {
    requiredFields: ['name', 'address', 'city', 'state'],
    maxLengths: {
        name: 100,
        notes: 500,
        address: 200,
        phone: 20,
        website: 255,
    },
    patterns: {
        phone: /^\(\d{3}\)\s\d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\+?[\d\s\-\(\)]{10,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        website:
            /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
        zipCode: /^\d{5}(-\d{4})?$/,
    },
    gpsCoordinateRanges: {
        latitude: { min: -90, max: 90 },
        longitude: { min: -180, max: 180 },
    },
};

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export class OrganizationValidator {
    private rules: OrganizationValidationRules;
    private settings: Setting[];

    constructor(
        rules = ORGANIZATION_VALIDATION_RULES,
        settings: Setting[] = []
    ) {
        this.rules = rules;
        this.settings = settings;
    }

    updateSettings(settings: Setting[]): void {
        this.settings = settings;
    }

    validateOrganization(data: Partial<Organization>): ValidationResult {
        const errors: ValidationError[] = [];

        // Validate required fields
        this.validateRequiredFields(data, errors);

        // Validate field lengths
        this.validateFieldLengths(data, errors);

        // Validate field patterns
        this.validateFieldPatterns(data, errors);

        // Validate GPS coordinates
        this.validateGpsCoordinates(data, errors);

        // Validate Settings relationships
        this.validateSettingsRelationships(data, errors);

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    private validateRequiredFields(
        data: Partial<Organization>,
        errors: ValidationError[]
    ): void {
        this.rules.requiredFields.forEach(field => {
            const value = data[field];
            if (value === undefined || value === null || value === '') {
                errors.push({
                    field,
                    message: `${field} is required`,
                    code: 'REQUIRED_FIELD_MISSING',
                });
            }
        });
    }

    private validateFieldLengths(
        data: Partial<Organization>,
        errors: ValidationError[]
    ): void {
        Object.entries(this.rules.maxLengths).forEach(([field, maxLength]) => {
            const value = data[field as keyof Organization] as string;
            if (value && value.length > maxLength) {
                errors.push({
                    field,
                    message: `${field} must be ${maxLength} characters or less`,
                    code: 'FIELD_TOO_LONG',
                });
            }
        });
    }

    private validateFieldPatterns(
        data: Partial<Organization>,
        errors: ValidationError[]
    ): void {
        // Validate phone number
        if (data.phone && !this.rules.patterns.phone.test(data.phone)) {
            errors.push({
                field: 'phone',
                message: 'Invalid phone number format',
                code: 'INVALID_PHONE_FORMAT',
            });
        }

        // Validate website URL
        if (data.website && !this.rules.patterns.website.test(data.website)) {
            errors.push({
                field: 'website',
                message: 'Invalid website URL format',
                code: 'INVALID_URL_FORMAT',
            });
        }

        // Validate account manager email
        if (
            data.accountManager &&
            !this.rules.patterns.email.test(data.accountManager)
        ) {
            errors.push({
                field: 'accountManager',
                message: 'Invalid email format for account manager',
                code: 'INVALID_EMAIL_FORMAT',
            });
        }

        // Validate zip code
        if (data.zipCode && !this.rules.patterns.zipCode.test(data.zipCode)) {
            errors.push({
                field: 'zipCode',
                message: 'Invalid ZIP code format (use 12345 or 12345-6789)',
                code: 'INVALID_ZIPCODE_FORMAT',
            });
        }
    }

    private validateGpsCoordinates(
        data: Partial<Organization>,
        errors: ValidationError[]
    ): void {
        if (data.latitude !== undefined) {
            const lat = Number(data.latitude);
            if (
                isNaN(lat) ||
                lat < this.rules.gpsCoordinateRanges.latitude.min ||
                lat > this.rules.gpsCoordinateRanges.latitude.max
            ) {
                errors.push({
                    field: 'latitude',
                    message: 'Latitude must be between -90 and 90 degrees',
                    code: 'INVALID_LATITUDE',
                });
            }
        }

        if (data.longitude !== undefined) {
            const lng = Number(data.longitude);
            if (
                isNaN(lng) ||
                lng < this.rules.gpsCoordinateRanges.longitude.min ||
                lng > this.rules.gpsCoordinateRanges.longitude.max
            ) {
                errors.push({
                    field: 'longitude',
                    message: 'Longitude must be between -180 and 180 degrees',
                    code: 'INVALID_LONGITUDE',
                });
            }
        }
    }

    private validateSettingsRelationships(
        data: Partial<Organization>,
        errors: ValidationError[]
    ): void {
        const validateSettingId = (
            fieldName: string,
            settingId: Identifier | undefined,
            category: string
        ) => {
            if (settingId !== undefined) {
                const setting = this.settings.find(
                    s =>
                        s.id === settingId &&
                        s.category === category &&
                        s.active
                );
                if (!setting) {
                    errors.push({
                        field: fieldName,
                        message: `Invalid ${category} setting`,
                        code: 'INVALID_SETTING_REFERENCE',
                    });
                }
            }
        };

        validateSettingId('priorityId', data.priorityId, 'priority');
        validateSettingId('segmentId', data.segmentId, 'segment');
        validateSettingId('distributorId', data.distributorId, 'distributor');
    }

    // Utility method to sanitize organization data
    sanitizeOrganization(data: Partial<Organization>): Partial<Organization> {
        const sanitized = { ...data };

        // Trim string fields
        if (sanitized.name) sanitized.name = sanitized.name.trim();
        if (sanitized.address) sanitized.address = sanitized.address.trim();
        if (sanitized.city) sanitized.city = sanitized.city.trim();
        if (sanitized.state)
            sanitized.state = sanitized.state.trim().toUpperCase();
        if (sanitized.zipCode) sanitized.zipCode = sanitized.zipCode.trim();
        if (sanitized.phone) sanitized.phone = sanitized.phone.trim();
        if (sanitized.website) {
            sanitized.website = sanitized.website.trim();
            // Ensure website has protocol
            if (sanitized.website && !sanitized.website.match(/^https?:\/\//)) {
                sanitized.website = 'https://' + sanitized.website;
            }
        }
        if (sanitized.accountManager)
            sanitized.accountManager = sanitized.accountManager
                .trim()
                .toLowerCase();

        // Truncate notes to max length
        if (
            sanitized.notes &&
            sanitized.notes.length > this.rules.maxLengths.notes
        ) {
            sanitized.notes = sanitized.notes.substring(
                0,
                this.rules.maxLengths.notes
            );
        }

        // Ensure GPS coordinates are numbers
        if (sanitized.latitude !== undefined) {
            sanitized.latitude = Number(sanitized.latitude);
        }
        if (sanitized.longitude !== undefined) {
            sanitized.longitude = Number(sanitized.longitude);
        }

        return sanitized;
    }
}

// Export a default validator instance
export const organizationValidator = new OrganizationValidator();
