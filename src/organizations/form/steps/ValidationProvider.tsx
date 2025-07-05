import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    Alert,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@/components/ui-kit';
import {
    ExclamationCircleIcon as ErrorIcon,
    ExclamationTriangleIcon as WarningIcon,
    CheckCircleIcon as SuccessIcon,
} from '@heroicons/react/24/outline';
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
        <ErrorIcon />
    ) : hasWarnings ? (
        <WarningIcon />
    ) : (
        <SuccessIcon />
    );

    return (
        <Alert
            severity={severity}
            className="mb-4"
            title={
                <div className="flex items-center gap-2">
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
                    {collapsible && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="ml-auto bg-transparent border-none cursor-pointer p-1 text-inherit"
                            aria-label={
                                expanded ? 'Collapse details' : 'Expand details'
                            }
                        >
                            {expanded ? '▼' : '▶'}
                        </button>
                    )}
                </div>
            }
        >

            {/* Success message */}
            {isValid && !hasWarnings && showSuccessMessage && (
                <Box>All fields are valid!</Box>
            )}

            {/* Validation details */}
            {expanded && (
                <div>
                    {/* Errors */}
                    {hasErrors && (
                        <Box className="mt-2">
                            <h4 className="m-0 mb-2 text-sm font-semibold">
                                Errors that must be fixed:
                            </h4>
                            <List dense className="pt-0">
                                {validation.errors.map((error, index) => (
                                    <ListItem
                                        key={`error-${index}`}
                                        className={`pl-0 rounded cursor-${
                                            onFieldClick ? 'pointer' : 'default'
                                        } hover:bg-gray-50`}
                                        onClick={() =>
                                            handleFieldClick(error.field)
                                        }
                                    >
                                        <ListItemIcon className="min-w-[24px]">
                                            <ErrorIcon className="w-4 h-4 text-red-600" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={error.message}
                                            secondary={`Field: ${error.field}`}
                                            className="text-sm"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Warnings */}
                    {hasWarnings && (
                        <Box className={hasErrors ? "mt-4" : "mt-2"}>
                            <h4 className="m-0 mb-2 text-sm font-semibold">
                                Suggestions for improvement:
                            </h4>
                            <List dense className="pt-0">
                                {validation.warnings.map((warning, index) => (
                                    <ListItem
                                        key={`warning-${index}`}
                                        className={`pl-0 rounded cursor-${
                                            onFieldClick ? 'pointer' : 'default'
                                        } hover:bg-gray-50`}
                                        onClick={() =>
                                            handleFieldClick(warning.field)
                                        }
                                    >
                                        <ListItemIcon className="min-w-[24px]">
                                            <WarningIcon className="w-4 h-4 text-yellow-600" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={warning.message}
                                            secondary={`Field: ${warning.field}`}
                                            className="text-sm"
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </div>
            )}
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
    const iconClass = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
    const colorClass = hasErrors ? 'text-red-600' : 'text-yellow-600';
    
    const icon = hasErrors ? (
        <ErrorIcon className={`${iconClass} ${colorClass}`} />
    ) : (
        <WarningIcon className={`${iconClass} ${colorClass}`} />
    );

    const messages = [...errors, ...warnings];
    const primaryMessage = messages[0]?.message;

    return (
        <Box
            className={`flex items-center gap-1 ${colorClass}`}
            title={primaryMessage}
        >
            {showIcon && icon}
            {showText && (
                <Box component="span" className="text-xs">
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
        <Box className="flex gap-1 flex-wrap">
            {modes.map(mode => (
                <button
                    key={mode.value}
                    onClick={() => onModeChange(mode.value)}
                    disabled={disabled}
                    className={`
                        px-2 py-1 border rounded text-xs
                        ${currentMode === mode.value 
                            ? 'border-blue-600 bg-blue-600 text-white' 
                            : 'border-gray-300 bg-transparent text-blue-600'
                        }
                        ${disabled 
                            ? 'cursor-not-allowed opacity-60' 
                            : 'cursor-pointer hover:bg-blue-50'
                        }
                    `}
                    title={mode.description}
                >
                    {mode.label}
                </button>
            ))}
        </Box>
    );
};
