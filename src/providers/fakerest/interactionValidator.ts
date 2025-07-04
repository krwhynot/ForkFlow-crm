import { Interaction, Setting } from '../../types';

export interface InteractionValidationError {
    field: string;
    message: string;
    code: string;
}

export interface InteractionValidationResult {
    isValid: boolean;
    errors: InteractionValidationError[];
    warnings: InteractionValidationError[];
}

/**
 * Comprehensive interaction validator for food service CRM
 * Handles validation for all 6 interaction types with mobile-specific considerations
 */
export class InteractionValidator {
    private settings: Setting[] = [];
    private interactionTypes: Setting[] = [];

    // Validation constants
    private readonly GPS_BOUNDS = {
        latitude: { min: -90, max: 90 },
        longitude: { min: -180, max: 180 },
    };

    private readonly FIELD_LIMITS = {
        subject: 200,
        description: 2000,
        outcome: 1000,
        followUpNotes: 500,
        locationNotes: 200,
    };

    private readonly REQUIRED_FIELDS: (keyof Interaction)[] = [
        'organizationId',
        'typeId',
        'subject',
    ];

    // Interaction types that require GPS coordinates
    private readonly GPS_REQUIRED_TYPES = ['in_person', 'demo'];

    updateSettings(settings: Setting[]): void {
        this.settings = settings;
        this.interactionTypes = settings.filter(
            s => s.category === 'interaction_type'
        );
    }

    /**
     * Comprehensive validation of interaction data
     */
    validateInteraction(
        interaction: Partial<Interaction>
    ): InteractionValidationResult {
        const errors: InteractionValidationError[] = [];
        const warnings: InteractionValidationError[] = [];

        // Required field validation
        this.validateRequiredFields(interaction, errors);

        // Type validation
        this.validateInteractionType(interaction, errors, warnings);

        // GPS validation
        this.validateGPSCoordinates(interaction, errors, warnings);

        // Date validation
        this.validateDates(interaction, errors, warnings);

        // Field length validation
        this.validateFieldLengths(interaction, errors);

        // Business logic validation
        this.validateBusinessLogic(interaction, errors, warnings);

        // Mobile-specific validation
        this.validateMobileConstraints(interaction, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Sanitize interaction data before validation/storage
     */
    sanitizeInteraction(
        interaction: Partial<Interaction>
    ): Partial<Interaction> {
        const sanitized = { ...interaction };

        // Trim string fields
        if (sanitized.subject) {
            sanitized.subject = sanitized.subject.trim();
        }
        if (sanitized.description) {
            sanitized.description = sanitized.description.trim();
        }
        if (sanitized.outcome) {
            sanitized.outcome = sanitized.outcome.trim();
        }
        if (sanitized.followUpNotes) {
            sanitized.followUpNotes = sanitized.followUpNotes.trim();
        }
        if (sanitized.locationNotes) {
            sanitized.locationNotes = sanitized.locationNotes.trim();
        }

        // Ensure boolean fields are properly set
        sanitized.isCompleted = Boolean(sanitized.isCompleted);
        sanitized.followUpRequired = Boolean(sanitized.followUpRequired);

        // Round GPS coordinates to reasonable precision (6 decimal places)
        if (sanitized.latitude !== undefined) {
            sanitized.latitude =
                Math.round(sanitized.latitude * 1000000) / 1000000;
        }
        if (sanitized.longitude !== undefined) {
            sanitized.longitude =
                Math.round(sanitized.longitude * 1000000) / 1000000;
        }

        // Ensure duration is positive integer
        if (sanitized.duration !== undefined) {
            sanitized.duration = Math.max(0, Math.floor(sanitized.duration));
        }

        return sanitized;
    }

    private validateRequiredFields(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[]
    ): void {
        this.REQUIRED_FIELDS.forEach(field => {
            if (!interaction[field]) {
                errors.push({
                    field,
                    message: `${field} is required`,
                    code: 'REQUIRED_FIELD_MISSING',
                });
            }
        });
    }

    private validateInteractionType(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[],
        warnings: InteractionValidationError[]
    ): void {
        if (!interaction.typeId) return;

        const interactionType = this.interactionTypes.find(
            t => t.id === interaction.typeId
        );

        if (!interactionType) {
            errors.push({
                field: 'typeId',
                message: 'Invalid interaction type',
                code: 'INVALID_INTERACTION_TYPE',
            });
            return;
        }

        if (!interactionType.active) {
            warnings.push({
                field: 'typeId',
                message: 'Interaction type is inactive',
                code: 'INACTIVE_INTERACTION_TYPE',
            });
        }

        // Validate GPS requirements for specific types
        if (this.GPS_REQUIRED_TYPES.includes(interactionType.key)) {
            if (!interaction.latitude || !interaction.longitude) {
                warnings.push({
                    field: 'latitude',
                    message: `GPS coordinates recommended for ${interactionType.label} interactions`,
                    code: 'GPS_RECOMMENDED',
                });
            }
        }
    }

    private validateGPSCoordinates(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[],
        warnings: InteractionValidationError[]
    ): void {
        // Both coordinates must be present if either is provided
        if (
            (interaction.latitude !== undefined &&
                interaction.longitude === undefined) ||
            (interaction.longitude !== undefined &&
                interaction.latitude === undefined)
        ) {
            errors.push({
                field: 'latitude',
                message:
                    'Both latitude and longitude must be provided together',
                code: 'INCOMPLETE_GPS_COORDINATES',
            });
            return;
        }

        // Validate coordinate ranges
        if (interaction.latitude !== undefined) {
            if (
                interaction.latitude < this.GPS_BOUNDS.latitude.min ||
                interaction.latitude > this.GPS_BOUNDS.latitude.max
            ) {
                errors.push({
                    field: 'latitude',
                    message: `Latitude must be between ${this.GPS_BOUNDS.latitude.min} and ${this.GPS_BOUNDS.latitude.max}`,
                    code: 'INVALID_LATITUDE',
                });
            }
        }

        if (interaction.longitude !== undefined) {
            if (
                interaction.longitude < this.GPS_BOUNDS.longitude.min ||
                interaction.longitude > this.GPS_BOUNDS.longitude.max
            ) {
                errors.push({
                    field: 'longitude',
                    message: `Longitude must be between ${this.GPS_BOUNDS.longitude.min} and ${this.GPS_BOUNDS.longitude.max}`,
                    code: 'INVALID_LONGITUDE',
                });
            }
        }

        // Validate GPS accuracy if provided
        if (interaction.latitude && interaction.longitude) {
            // Check for obviously invalid coordinates (e.g., 0,0 which is in the ocean)
            if (interaction.latitude === 0 && interaction.longitude === 0) {
                warnings.push({
                    field: 'latitude',
                    message:
                        'GPS coordinates appear to be default values (0,0)',
                    code: 'SUSPICIOUS_GPS_COORDINATES',
                });
            }
        }
    }

    private validateDates(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[],
        warnings: InteractionValidationError[]
    ): void {
        const now = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(now.getFullYear() + 1);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        // Validate scheduled date
        if (interaction.scheduledDate) {
            const scheduledDate = new Date(interaction.scheduledDate);
            if (isNaN(scheduledDate.getTime())) {
                errors.push({
                    field: 'scheduledDate',
                    message: 'Invalid scheduled date format',
                    code: 'INVALID_DATE_FORMAT',
                });
            } else {
                // Warn about very old or future dates
                if (scheduledDate < oneYearAgo) {
                    warnings.push({
                        field: 'scheduledDate',
                        message: 'Scheduled date is more than a year ago',
                        code: 'OLD_SCHEDULED_DATE',
                    });
                }
                if (scheduledDate > oneYearFromNow) {
                    warnings.push({
                        field: 'scheduledDate',
                        message:
                            'Scheduled date is more than a year in the future',
                        code: 'FUTURE_SCHEDULED_DATE',
                    });
                }
            }
        }

        // Validate completed date
        if (interaction.completedDate) {
            const completedDate = new Date(interaction.completedDate);
            if (isNaN(completedDate.getTime())) {
                errors.push({
                    field: 'completedDate',
                    message: 'Invalid completed date format',
                    code: 'INVALID_DATE_FORMAT',
                });
            } else {
                // Completed date cannot be in the future
                if (completedDate > now) {
                    errors.push({
                        field: 'completedDate',
                        message: 'Completed date cannot be in the future',
                        code: 'FUTURE_COMPLETED_DATE',
                    });
                }

                // If both dates exist, completed should be after scheduled
                if (interaction.scheduledDate) {
                    const scheduledDate = new Date(interaction.scheduledDate);
                    if (completedDate < scheduledDate) {
                        warnings.push({
                            field: 'completedDate',
                            message: 'Completed date is before scheduled date',
                            code: 'COMPLETED_BEFORE_SCHEDULED',
                        });
                    }
                }
            }
        }

        // Validate follow-up date
        if (interaction.followUpDate) {
            const followUpDate = new Date(interaction.followUpDate);
            if (isNaN(followUpDate.getTime())) {
                errors.push({
                    field: 'followUpDate',
                    message: 'Invalid follow-up date format',
                    code: 'INVALID_DATE_FORMAT',
                });
            } else {
                // Follow-up date should be in the future
                if (followUpDate <= now) {
                    warnings.push({
                        field: 'followUpDate',
                        message: 'Follow-up date should be in the future',
                        code: 'PAST_FOLLOWUP_DATE',
                    });
                }
            }
        }
    }

    private validateFieldLengths(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[]
    ): void {
        Object.entries(this.FIELD_LIMITS).forEach(([field, limit]) => {
            const value = interaction[field as keyof Interaction] as string;
            if (value && value.length > limit) {
                errors.push({
                    field,
                    message: `${field} cannot exceed ${limit} characters`,
                    code: 'FIELD_TOO_LONG',
                });
            }
        });
    }

    private validateBusinessLogic(
        interaction: Partial<Interaction>,
        errors: InteractionValidationError[],
        warnings: InteractionValidationError[]
    ): void {
        // If interaction is completed, it should have a completion date
        if (interaction.isCompleted && !interaction.completedDate) {
            warnings.push({
                field: 'completedDate',
                message: 'Completed interactions should have a completion date',
                code: 'MISSING_COMPLETION_DATE',
            });
        }

        // If follow-up is required, it should have a follow-up date
        if (interaction.followUpRequired && !interaction.followUpDate) {
            errors.push({
                field: 'followUpDate',
                message: 'Follow-up date is required when follow-up is needed',
                code: 'MISSING_FOLLOWUP_DATE',
            });
        }

        // Duration validation
        if (interaction.duration !== undefined) {
            if (interaction.duration < 0) {
                errors.push({
                    field: 'duration',
                    message: 'Duration cannot be negative',
                    code: 'INVALID_DURATION',
                });
            }
            if (interaction.duration > 1440) {
                // 24 hours
                warnings.push({
                    field: 'duration',
                    message: 'Duration exceeds 24 hours - please verify',
                    code: 'LONG_DURATION',
                });
            }
        }

        // Attachment validation
        if (interaction.attachments && interaction.attachments.length > 10) {
            warnings.push({
                field: 'attachments',
                message: 'Large number of attachments may affect performance',
                code: 'MANY_ATTACHMENTS',
            });
        }
    }

    private validateMobileConstraints(
        interaction: Partial<Interaction>,
        warnings: InteractionValidationError[]
    ): void {
        // Warn about very long descriptions for mobile users
        if (interaction.description && interaction.description.length > 500) {
            warnings.push({
                field: 'description',
                message:
                    'Long descriptions may be difficult to read on mobile devices',
                code: 'MOBILE_USABILITY_CONCERN',
            });
        }

        // Warn about missing subject for mobile workflow
        if (!interaction.subject || interaction.subject.trim().length < 3) {
            warnings.push({
                field: 'subject',
                message:
                    'Clear subjects help with mobile interaction management',
                code: 'MOBILE_WORKFLOW_RECOMMENDATION',
            });
        }
    }

    /**
     * Validate file attachment
     */
    validateAttachment(file: File): InteractionValidationResult {
        const errors: InteractionValidationError[] = [];
        const warnings: InteractionValidationError[] = [];

        // File size validation (max 10MB for mobile compatibility)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push({
                field: 'attachment',
                message: 'File size cannot exceed 10MB',
                code: 'FILE_TOO_LARGE',
            });
        }

        // File type validation
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        if (!allowedTypes.includes(file.type)) {
            errors.push({
                field: 'attachment',
                message: 'File type not supported',
                code: 'UNSUPPORTED_FILE_TYPE',
            });
        }

        // Warn about large files for mobile users
        if (file.size > 2 * 1024 * 1024) {
            // 2MB
            warnings.push({
                field: 'attachment',
                message: 'Large files may upload slowly on mobile networks',
                code: 'MOBILE_UPLOAD_WARNING',
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}

// Singleton instance for use across the application
export const interactionValidator = new InteractionValidator();
