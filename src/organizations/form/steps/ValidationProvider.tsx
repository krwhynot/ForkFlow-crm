import {
    Alert,
    AlertTitle, Box, Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@/components/ui-kit';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { createContext, useCallback, useContext, useState } from 'react';
import {
    StepValidationResult,
    ValidationError,
    ValidationWarning,
} from './types';

interface ValidationContextType {
    showValidationSummary: boolean;
    setShowValidationSummary: (show: boolean) => void;
    validationSummary: StepValidationResult | null;
    setValidationSummary: (summary: StepValidationResult | null) => void;
    highlightedFields: Set<string>;
    setHighlightedFields: (fields: Set<string>) => void;
    validationMode: 'realtime' | 'onsubmit' | 'onblur';
    setValidationMode: (mode: 'realtime' | 'onsubmit' | 'onblur') => void;
}

const ValidationContext = createContext<ValidationContextType | null>(null);

interface ValidationProviderProps {
    children: React.ReactNode;
    defaultValidationMode?: 'realtime' | 'onsubmit' | 'onblur';
}

/**
 * ValidationProvider component that manages form validation state and UI
 * Features:
 * - Global validation summary display
 * - Field highlighting for errors/warnings
 * - Configurable validation modes
 * - Accessible validation feedback
 */
export const ValidationProvider: React.FC<ValidationProviderProps> = ({
    children,
    defaultValidationMode = 'realtime',
}) => {
    const [showValidationSummary, setShowValidationSummary] = useState(false);
    const [validationSummary, setValidationSummary] =
        useState<StepValidationResult | null>(null);
    const [highlightedFields, setHighlightedFields] = useState<Set<string>>(
        new Set()
    );
    const [validationMode, setValidationMode] = useState<
        'realtime' | 'onsubmit' | 'onblur'
    >(defaultValidationMode);

    const contextValue: ValidationContextType = {
        showValidationSummary,
        setShowValidationSummary,
        validationSummary,
        setValidationSummary,
        highlightedFields,
        setHighlightedFields,
        validationMode,
        setValidationMode,
    };

    return (
        <ValidationContext.Provider value={contextValue}>
            {children}
        </ValidationContext.Provider>
    );
};

/**
 * Hook to access validation context
 */
export const useValidationContext = () => {
    const context = useContext(ValidationContext);
    if (!context) {
        throw new Error(
            'useValidationContext must be used within a ValidationProvider'
        );
    }
    return context;
};

interface ValidationSummaryProps {
    validation: StepValidationResult;
    title?: string;
    showSuccessMessage?: boolean;
    collapsible?: boolean;
    onFieldClick?: (fieldName: string) => void;
}

/**
 * ValidationSummary component displays a comprehensive validation summary
 * Features:
 * - Grouped errors and warnings
 * - Clickable field names for navigation
 * - Collapsible sections
 * - Accessibility support
 */
export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
    validation,
    title = 'Form Validation',
    showSuccessMessage = true,
    collapsible = true,
    onFieldClick,
}) => {
    const [expanded, setExpanded] = useState(true);

    const handleFieldClick = useCallback(
        (fieldName: string) => {
            if (onFieldClick) {
                onFieldClick(fieldName);
            } else {
                // Default behavior: scroll to field
                const element = document.querySelector(
                    `[name="${fieldName}"], #${fieldName}`
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    // Focus the field if it's an input
                    if (
                        element instanceof HTMLInputElement ||
                        element instanceof HTMLTextAreaElement
                    ) {
                        element.focus();
                    }
                }
            }
        },
        [onFieldClick]
    );

    const hasErrors = validation.errors.length > 0;
    const hasWarnings = validation.warnings.length > 0;
    const isValid = validation.isValid;

    if (!hasErrors && !hasWarnings && !showSuccessMessage) {
        return null;
    }

    const severity = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';
    const icon = hasErrors ? (
        <XCircleIcon className="h-6 w-6 text-red-500" />
    ) : hasWarnings ? (
        <XCircleIcon className="h-6 w-6 text-yellow-500" />
    ) : (
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
    );

    return (
        <Alert
            severity={severity}
            sx={{ mb: 2 }}
            action={
                collapsible ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: 'inherit',
                        }}
                        aria-label={
                            expanded ? 'Collapse details' : 'Expand details'
                        }
                    >
                        {expanded ? '▼' : '▶'}
                    </button>
                ) : undefined
            }
        >
            <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                {title}
                {hasErrors && (
                    <span>
                        ({validation.errors.length} error
                        {validation.errors.length > 1 ? 's' : ''})
                    </span>
                )}
                {hasWarnings && (
                    <span>
                        ({validation.warnings.length} warning
                        {validation.warnings.length > 1 ? 's' : ''})
                    </span>
                )}
            </AlertTitle>

            {/* Success message */}
            {isValid && !hasWarnings && showSuccessMessage && (
                <Box>All fields are valid!</Box>
            )}

            {/* Validation details */}
            <Collapse in={expanded}>
                {/* Errors */}
                {hasErrors && (
                    <Box sx={{ mt: 1 }}>
                        <Box
                            component="h4"
                            sx={{
                                m: 0,
                                mb: 1,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                            }}
                        >
                            Errors that must be fixed:
                        </Box>
                        <List dense sx={{ pt: 0 }}>
                            {validation.errors.map((error, index) => (
                                <ListItem
                                    key={`error-${index}`}
                                    sx={{
                                        pl: 0,
                                        cursor: onFieldClick
                                            ? 'pointer'
                                            : 'default',
                                        '&:hover': onFieldClick
                                            ? {
                                                backgroundColor:
                                                    'rgba(0,0,0,0.04)',
                                            }
                                            : {},
                                        borderRadius: 1,
                                    }}
                                    onClick={() =>
                                        handleFieldClick(error.field)
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                        <XCircleIcon className="h-4 w-4 text-red-500" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={error.message}
                                        secondary={`Field: ${error.field}`}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                        }}
                                        secondaryTypographyProps={{
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                {/* Warnings */}
                {hasWarnings && (
                    <Box sx={{ mt: hasErrors ? 2 : 1 }}>
                        <Box
                            component="h4"
                            sx={{
                                m: 0,
                                mb: 1,
                                fontSize: '0.875rem',
                                fontWeight: 600,
                            }}
                        >
                            Suggestions for improvement:
                        </Box>
                        <List dense sx={{ pt: 0 }}>
                            {validation.warnings.map((warning, index) => (
                                <ListItem
                                    key={`warning-${index}`}
                                    sx={{
                                        pl: 0,
                                        cursor: onFieldClick
                                            ? 'pointer'
                                            : 'default',
                                        '&:hover': onFieldClick
                                            ? {
                                                backgroundColor:
                                                    'rgba(0,0,0,0.04)',
                                            }
                                            : {},
                                        borderRadius: 1,
                                    }}
                                    onClick={() =>
                                        handleFieldClick(warning.field)
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 24 }}>
                                        <XCircleIcon className="h-4 w-4 text-yellow-500" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={warning.message}
                                        secondary={`Field: ${warning.field}`}
                                        primaryTypographyProps={{
                                            fontSize: '0.875rem',
                                        }}
                                        secondaryTypographyProps={{
                                            fontSize: '0.75rem',
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Collapse>
        </Alert>
    );
};

interface FieldValidationIndicatorProps {
    fieldName: string;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    showIcon?: boolean;
    showText?: boolean;
    size?: 'small' | 'medium';
}

/**
 * FieldValidationIndicator displays validation status for individual fields
 */
export const FieldValidationIndicator: React.FC<
    FieldValidationIndicatorProps
> = ({
    fieldName,
    errors,
    warnings,
    showIcon = true,
    showText = false,
    size = 'small',
}) => {
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;

        if (!hasErrors && !hasWarnings) {
            return null;
        }

        const severity = hasErrors ? 'error' : 'warning';
        const icon = hasErrors ? (
            <XCircleIcon className={`h-${size} w-${size} text-red-500`} />
        ) : (
            <XCircleIcon className={`h-${size} w-${size} text-yellow-500`} />
        );

        const messages = [...errors, ...warnings];
        const primaryMessage = messages[0]?.message;

        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: severity === 'error' ? 'error.main' : 'warning.main',
                }}
                title={primaryMessage}
            >
                {showIcon && icon}
                {showText && (
                    <Box component="span" sx={{ fontSize: '0.75rem' }}>
                        {primaryMessage}
                        {messages.length > 1 && ` (+${messages.length - 1} more)`}
                    </Box>
                )}
            </Box>
        );
    };

interface ValidationModeToggleProps {
    currentMode: 'realtime' | 'onsubmit' | 'onblur';
    onModeChange: (mode: 'realtime' | 'onsubmit' | 'onblur') => void;
    disabled?: boolean;
}

/**
 * ValidationModeToggle allows users to switch between validation modes
 */
export const ValidationModeToggle: React.FC<ValidationModeToggleProps> = ({
    currentMode,
    onModeChange,
    disabled = false,
}) => {
    const modes = [
        {
            value: 'realtime',
            label: 'Real-time',
            description: 'Validate as you type',
        },
        {
            value: 'onblur',
            label: 'On blur',
            description: 'Validate when leaving field',
        },
        {
            value: 'onsubmit',
            label: 'On submit',
            description: 'Validate only when submitting',
        },
    ] as const;

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {modes.map(mode => (
                <button
                    key={mode.value}
                    onClick={() => onModeChange(mode.value)}
                    disabled={disabled}
                    style={{
                        padding: '4px 8px',
                        border: '1px solid',
                        borderColor:
                            currentMode === mode.value ? '#1976d2' : '#ccc',
                        backgroundColor:
                            currentMode === mode.value
                                ? '#1976d2'
                                : 'transparent',
                        color: currentMode === mode.value ? 'white' : '#1976d2',
                        borderRadius: '4px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        opacity: disabled ? 0.6 : 1,
                    }}
                    title={mode.description}
                >
                    {mode.label}
                </button>
            ))}
        </Box>
    );
};
