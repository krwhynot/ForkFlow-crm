import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Chip,
    Typography,
    Paper,
    List,
} from '@/components/ui-kit';
import {
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    ClipboardDocumentIcon,
    QrCodeIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    MapPinIcon,
    HashtagIcon,
} from '@heroicons/react/24/outline';
import { TextInput, TextInputProps } from 'react-admin';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface SmartKeyboardProps extends Omit<TextInputProps, 'type'> {
    fieldType:
        | 'text'
        | 'email'
        | 'phone'
        | 'url'
        | 'number'
        | 'password'
        | 'search'
        | 'address';
    autoComplete?: string;
    suggestions?: string[];
    showClearButton?: boolean;
    showCopyButton?: boolean;
    formatValue?: (value: string) => string;
    validateFormat?: (value: string) => boolean;
    onScanQR?: () => void;
    maxLength?: number;
    enableSmartSuggestions?: boolean;
    preventAutocorrect?: boolean;
}

/**
 * Smart keyboard component that adapts input behavior based on field type
 * Features:
 * - Automatic keyboard type switching for mobile
 * - Smart input formatting (phone, email, URL, etc.)
 * - Input validation with visual feedback
 * - Autocomplete suggestions
 * - QR code scanning integration
 * - Copy/paste functionality
 * - Input masks and formatting
 * - Accessibility optimizations
 */
export const SmartKeyboard: React.FC<SmartKeyboardProps> = ({
    fieldType,
    autoComplete,
    suggestions = [],
    showClearButton = true,
    showCopyButton = false,
    formatValue,
    validateFormat,
    onScanQR,
    maxLength,
    enableSmartSuggestions = true,
    preventAutocorrect = false,
    source,
    ...textInputProps
}) => {
    const isMobile = useBreakpoint('md');
    const [showPassword, setShowPassword] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(
        []
    );
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get input type and keyboard type for mobile
    const getInputConfig = useCallback(() => {
        const configs = {
            text: {
                type: 'text',
                inputMode: 'text' as const,
                pattern: undefined,
                autoComplete: autoComplete || 'off',
            },
            email: {
                type: 'email',
                inputMode: 'email' as const,
                pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
                autoComplete: autoComplete || 'email',
            },
            phone: {
                type: 'tel',
                inputMode: 'tel' as const,
                pattern: '[0-9\\s\\-\\(\\)\\+]*',
                autoComplete: autoComplete || 'tel',
            },
            url: {
                type: 'url',
                inputMode: 'url' as const,
                pattern: 'https?://.+',
                autoComplete: autoComplete || 'url',
            },
            number: {
                type: 'number',
                inputMode: 'numeric' as const,
                pattern: '[0-9]*',
                autoComplete: autoComplete || 'off',
            },
            password: {
                type: showPassword ? 'text' : 'password',
                inputMode: 'text' as const,
                pattern: undefined,
                autoComplete: autoComplete || 'current-password',
            },
            search: {
                type: 'search',
                inputMode: 'search' as const,
                pattern: undefined,
                autoComplete: autoComplete || 'off',
            },
            address: {
                type: 'text',
                inputMode: 'text' as const,
                pattern: undefined,
                autoComplete: autoComplete || 'street-address',
            },
        };

        return configs[fieldType] || configs.text;
    }, [fieldType, showPassword, autoComplete]);

    // Format input value based on field type
    const formatInputValue = useCallback(
        (value: string) => {
            if (formatValue) {
                return formatValue(value);
            }

            switch (fieldType) {
                case 'phone':
                    return formatPhoneNumber(value);
                case 'email':
                    return value.toLowerCase().trim();
                case 'url':
                    return formatURL(value);
                case 'number':
                    return value.replace(/[^0-9.-]/g, '');
                default:
                    return value;
            }
        },
        [fieldType, formatValue]
    );

    // Phone number formatting
    const formatPhoneNumber = useCallback((value: string) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length >= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        } else if (digits.length >= 3) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        }
        return digits;
    }, []);

    // URL formatting
    const formatURL = useCallback((value: string) => {
        const trimmed = value.trim();
        if (
            trimmed &&
            !trimmed.startsWith('http://') &&
            !trimmed.startsWith('https://')
        ) {
            return `https://${trimmed}`;
        }
        return trimmed;
    }, []);

    // Validate input format
    const validateInput = useCallback(
        (value: string) => {
            if (validateFormat) {
                return validateFormat(value);
            }

            if (!value) return true; // Empty values are valid

            switch (fieldType) {
                case 'email':
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                case 'phone':
                    return /^\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(
                        value
                    );
                case 'url':
                    try {
                        new URL(
                            value.startsWith('http')
                                ? value
                                : `https://${value}`
                        );
                        return true;
                    } catch {
                        return false;
                    }
                case 'number':
                    return !isNaN(Number(value));
                default:
                    return true;
            }
        },
        [fieldType, validateFormat]
    );

    // Handle input change
    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            let value = event.target.value;

            // Apply max length
            if (maxLength && value.length > maxLength) {
                value = value.slice(0, maxLength);
            }

            // Format value
            const formattedValue = formatInputValue(value);
            setInputValue(formattedValue);

            // Validate
            const valid = validateInput(formattedValue);
            setIsValid(valid);

            // Update suggestions
            if (enableSmartSuggestions && suggestions.length > 0) {
                const filtered = suggestions
                    .filter(suggestion =>
                        suggestion.toLowerCase().includes(value.toLowerCase())
                    )
                    .slice(0, 5);
                setFilteredSuggestions(filtered);
                setShowSuggestions(filtered.length > 0 && value.length > 0);
            }

            // Call parent onChange
            if (textInputProps.onChange) {
                textInputProps.onChange({
                    ...event,
                    target: { ...event.target, value: formattedValue },
                });
            }
        },
        [
            maxLength,
            formatInputValue,
            validateInput,
            enableSmartSuggestions,
            suggestions,
            textInputProps.onChange,
        ]
    );

    // Handle suggestion click
    const handleSuggestionClick = useCallback(
        (suggestion: string) => {
            const formattedValue = formatInputValue(suggestion);
            setInputValue(formattedValue);
            setShowSuggestions(false);

            if (inputRef.current) {
                inputRef.current.value = formattedValue;
                inputRef.current.focus();
            }
        },
        [formatInputValue]
    );

    // Clear input
    const handleClear = useCallback(() => {
        setInputValue('');
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    }, []);

    // Copy to clipboard
    const handleCopy = useCallback(async () => {
        if (inputValue && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(inputValue);
                // Could add toast notification here
            } catch (error) {
                console.error('Failed to copy to clipboard:', error);
            }
        }
    }, [inputValue]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    // Get field icon
    const getFieldIcon = useCallback(() => {
        const iconProps = {
            className: 'w-4 h-4 text-gray-500',
        };

        switch (fieldType) {
            case 'email':
                return <EnvelopeIcon {...iconProps} />;
            case 'phone':
                return <DevicePhoneMobileIcon {...iconProps} />;
            case 'url':
                return <GlobeAltIcon {...iconProps} />;
            case 'address':
                return <MapPinIcon {...iconProps} />;
            case 'number':
                return <HashtagIcon {...iconProps} />;
            default:
                return null;
        }
    }, [fieldType]);

    // Generate smart suggestions based on field type
    useEffect(() => {
        if (!enableSmartSuggestions) return;

        const generateSuggestions = () => {
            switch (fieldType) {
                case 'email':
                    return [
                        '@gmail.com',
                        '@yahoo.com',
                        '@hotmail.com',
                        '@outlook.com',
                    ];
                case 'url':
                    return ['https://www.', 'https://', 'www.'];
                case 'phone':
                    return ['(555) ', '+1 '];
                default:
                    return [];
            }
        };

        if (suggestions.length === 0) {
            setFilteredSuggestions(generateSuggestions());
        }
    }, [fieldType, suggestions, enableSmartSuggestions]);

    const inputConfig = getInputConfig();
    const fieldIcon = getFieldIcon();

    return (
        <Box className="relative w-full">
            <TextField
                ref={inputRef}
                name={source}
                {...textInputProps}
                type={inputConfig.type}
                inputMode={inputConfig.inputMode}
                pattern={inputConfig.pattern}
                autoComplete={inputConfig.autoComplete}
                onChange={handleInputChange}
                error={textInputProps.error || !isValid}
                value={inputValue}
                startAdornment={fieldIcon}
                endAdornment={
                    <div className="flex items-center gap-1">
                        {/* QR Code Scanner */}
                        {onScanQR && fieldType !== 'password' && (
                            <IconButton
                                size="small"
                                onClick={onScanQR}
                                className="mr-1"
                                aria-label="Scan QR code"
                            >
                                <QrCodeIcon className="w-4 h-4" />
                            </IconButton>
                        )}

                        {/* Copy Button */}
                        {showCopyButton &&
                            inputValue &&
                            fieldType !== 'password' && (
                                <IconButton
                                    size="small"
                                    onClick={handleCopy}
                                    className="mr-1"
                                    aria-label="Copy to clipboard"
                                >
                                    <ClipboardDocumentIcon className="w-4 h-4" />
                                </IconButton>
                            )}

                        {/* Password Visibility Toggle */}
                        {fieldType === 'password' && (
                            <IconButton
                                size="small"
                                onClick={togglePasswordVisibility}
                                className="mr-1"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-4 h-4" />
                                ) : (
                                    <EyeIcon className="w-4 h-4" />
                                )}
                            </IconButton>
                        )}

                        {/* Clear Button */}
                        {showClearButton && inputValue && (
                            <IconButton
                                size="small"
                                onClick={handleClear}
                                aria-label="Clear input"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </IconButton>
                        )}
                    </div>
                }
                autoCorrect={preventAutocorrect ? 'off' : 'on'}
                autoCapitalize={
                    fieldType === 'email' || fieldType === 'url'
                        ? 'off'
                        : 'on'
                }
                spellCheck={
                    fieldType === 'email' ||
                    fieldType === 'url' ||
                    fieldType === 'number'
                        ? false
                        : true
                }
                className={`${textInputProps.error || !isValid ? 'border-red-500' : ''}`}
            />

            {/* Character count */}
            {maxLength && (
                <Typography
                    variant="caption"
                    className={`absolute right-2 -bottom-5 ${
                        inputValue.length > maxLength * 0.9
                            ? 'text-orange-500'
                            : 'text-gray-500'
                    }`}
                >
                    {inputValue.length}/{maxLength}
                </Typography>
            )}

            {/* Suggestions dropdown */}
            <div
                className={`
                    absolute top-full left-0 right-0 z-50 max-h-48 overflow-auto mt-1
                    transition-all duration-200 ease-in-out
                    ${showSuggestions ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}
            >
                <Paper className="shadow-lg">
                    <List className="py-0">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 min-h-11 border-0 bg-transparent"
                            >
                                <Typography variant="body2">
                                    {suggestion}
                                </Typography>
                            </button>
                        ))}
                    </List>
                </Paper>
            </div>

            {/* Format hints */}
            {!isValid && inputValue && (
                <Typography
                    variant="caption"
                    className="absolute left-0 -bottom-5 text-xs text-red-600"
                >
                    {fieldType === 'email' && 'Please enter a valid email address'}
                    {fieldType === 'phone' && 'Please enter a valid phone number'}
                    {fieldType === 'url' && 'Please enter a valid URL'}
                    {fieldType === 'number' && 'Please enter a valid number'}
                </Typography>
            )}
        </Box>
    );
};
