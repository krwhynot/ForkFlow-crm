import React, { useEffect, useRef, useState } from 'react';
import { MenuItem } from './Menu';
import { Paper } from './Paper';
import { TextField } from './TextField';

interface AutocompleteOption {
    id: string | number;
    label: string;
    value: any;
}

interface AutocompleteProps {
    id?: string;
    label?: string;
    placeholder?: string;
    options: AutocompleteOption[];
    value?: AutocompleteOption | null;
    defaultValue?: AutocompleteOption | null;
    onChange?: (event: React.SyntheticEvent, value: AutocompleteOption | null) => void;
    onInputChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
    disabled?: boolean;
    fullWidth?: boolean;
    multiple?: boolean;
    className?: string;
    renderOption?: (props: any, option: AutocompleteOption) => React.ReactNode;
    getOptionLabel?: (option: AutocompleteOption) => string;
    isOptionEqualToValue?: (option: AutocompleteOption, value: AutocompleteOption) => boolean;
    noOptionsText?: string;
    loading?: boolean;
    loadingText?: string;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
    id,
    label,
    placeholder,
    options = [],
    value,
    defaultValue,
    onChange,
    onInputChange,
    disabled = false,
    fullWidth = false,
    multiple = false,
    className = '',
    renderOption,
    getOptionLabel = (option) => option.label,
    isOptionEqualToValue = (option, value) => option.id === value.id,
    noOptionsText = 'No options',
    loading = false,
    loadingText = 'Loading...',
    ...props
}) => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(value || defaultValue || null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options based on input
    const filteredOptions = options.filter(option =>
        getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
    );

    // Handle input change
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        setOpen(true);
        onInputChange?.(event, newValue);
    };

    // Handle option selection
    const handleOptionClick = (option: AutocompleteOption) => {
        setSelectedOption(option);
        setInputValue(getOptionLabel(option));
        setOpen(false);
        onChange?.(new Event('change') as any, option);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update input value when value prop changes
    useEffect(() => {
        if (value !== undefined) {
            setSelectedOption(value);
            setInputValue(value ? getOptionLabel(value) : '');
        }
    }, [value, getOptionLabel]);

    return (
        <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
            <TextField
                id={id}
                label={label}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setOpen(true)}
                disabled={disabled}
                fullWidth={fullWidth}
                {...props}
            />

            {open && (
                <Paper className="absolute top-full left-0 right-0 z-50 max-h-60 overflow-auto mt-1 shadow-lg">
                    {loading ? (
                        <div className="px-4 py-2 text-gray-500">{loadingText}</div>
                    ) : filteredOptions.length === 0 ? (
                        <div className="px-4 py-2 text-gray-500">{noOptionsText}</div>
                    ) : (
                        filteredOptions.map((option) => (
                            <MenuItem
                                key={option.id}
                                onClick={() => handleOptionClick(option)}
                                className={`
                  cursor-pointer hover:bg-gray-50 px-4 py-2 
                  ${selectedOption && isOptionEqualToValue(option, selectedOption) ? 'bg-blue-50 text-blue-700' : ''}
                `}
                            >
                                {renderOption ? renderOption({}, option) : getOptionLabel(option)}
                            </MenuItem>
                        ))
                    )}
                </Paper>
            )}
        </div>
    );
};

export default Autocomplete; 