import React, { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

export interface AutocompleteOption {
    label: string;
    value: any;
    disabled?: boolean;
    group?: string;
}

export interface AutocompleteProps<T = any> {
    value?: T | T[];
    defaultValue?: T | T[];
    onChange?: (value: T | T[] | null) => void;
    options: T[] | AutocompleteOption[];
    getOptionLabel?: (option: T) => string;
    getOptionDisabled?: (option: T) => boolean;
    isOptionEqualToValue?: (option: T, value: T) => boolean;
    multiple?: boolean;
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    noOptionsText?: string;
    placeholder?: string;
    label?: string;
    helperText?: string;
    error?: boolean;
    required?: boolean;
    fullWidth?: boolean;
    size?: 'small' | 'medium' | 'large';
    freeSolo?: boolean;
    groupBy?: (option: T) => string;
    renderOption?: (option: T, state: { selected: boolean }) => React.ReactNode;
    renderInput?: (params: any) => React.ReactNode;
    className?: string;
}

export function Autocomplete<T = any>({
    value,
    defaultValue,
    onChange,
    options,
    getOptionLabel,
    getOptionDisabled,
    isOptionEqualToValue,
    multiple = false,
    disabled = false,
    loading = false,
    loadingText = 'Loading...',
    noOptionsText = 'No options',
    placeholder = 'Select...',
    label,
    helperText,
    error = false,
    required = false,
    fullWidth = false,
    size = 'medium',
    freeSolo = false,
    groupBy,
    renderOption,
    className,
}: AutocompleteProps<T>) {
    const [query, setQuery] = useState('');
    const [internalValue, setInternalValue] = useState<T | T[] | null>(
        defaultValue || (multiple ? [] : null)
    );

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const getLabel = (option: T | AutocompleteOption): string => {
        if (!option) return '';
        if (getOptionLabel) return getOptionLabel(option as T);
        if (typeof option === 'object' && 'label' in option) return option.label;
        return String(option);
    };

    const getValue = (option: T | AutocompleteOption): T => {
        if (typeof option === 'object' && 'value' in option) return option.value;
        return option as T;
    };

    const isDisabled = (option: T | AutocompleteOption): boolean => {
        if (getOptionDisabled) return getOptionDisabled(option as T);
        if (typeof option === 'object' && 'disabled' in option) return option.disabled || false;
        return false;
    };

    const isEqual = (a: T, b: T): boolean => {
        if (isOptionEqualToValue) return isOptionEqualToValue(a, b);
        return a === b;
    };

    const filteredOptions = query === ''
        ? options
        : options.filter((option) => {
            const label = getLabel(option).toLowerCase();
            return label.includes(query.toLowerCase());
        });

    const handleChange = (newValue: T | T[] | null) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onChange?.(newValue);
    };

    const sizeClasses = {
        small: 'min-h-[40px] text-sm',
        medium: 'min-h-[44px] text-base',
        large: 'min-h-[48px] text-lg',
    };

    const inputClasses = twMerge(
        'w-full border rounded-lg px-3 py-2 pr-10',
        'placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-opacity-50',
        'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
        sizeClasses[size],
        fullWidth && 'w-full'
    );

    const labelClasses = twMerge(
        'block text-sm font-medium mb-1',
        error ? 'text-red-600' : 'text-gray-700',
        disabled && 'text-gray-400'
    );

    const helperTextClasses = twMerge(
        'mt-1 text-sm',
        error ? 'text-red-600' : 'text-gray-500'
    );

    // Group options if groupBy is provided
    const groupedOptions = React.useMemo(() => {
        if (!groupBy) return { '': filteredOptions };
        
        return filteredOptions.reduce((groups, option) => {
            const group = groupBy(getValue(option));
            if (!groups[group]) groups[group] = [];
            groups[group].push(option);
            return groups;
        }, {} as Record<string, typeof options>);
    }, [filteredOptions, groupBy]);

    if (multiple) {
        // Multiple selection implementation would go here
        // For brevity, showing single selection only
        return <div>Multiple selection not implemented in this example</div>;
    }

    return (
        <div className={twMerge('relative', fullWidth && 'w-full', className)}>
            {label && (
                <label className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <Combobox
                value={currentValue}
                onChange={handleChange}
                disabled={disabled}
            >
                <div className="relative">
                    <Combobox.Input
                        className={inputClasses}
                        placeholder={placeholder}
                        displayValue={(option: T) => getLabel(option)}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>

                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {loading ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                {loadingText}
                            </div>
                        ) : filteredOptions.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                {noOptionsText}
                            </div>
                        ) : (
                            Object.entries(groupedOptions).map(([group, groupOptions]) => (
                                <Fragment key={group}>
                                    {group && groupBy && (
                                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                            {group}
                                        </div>
                                    )}
                                    {groupOptions.map((option, index) => {
                                        const optionValue = getValue(option);
                                        const optionLabel = getLabel(option);
                                        const optionDisabled = isDisabled(option);

                                        return (
                                            <Combobox.Option
                                                key={index}
                                                value={optionValue}
                                                disabled={optionDisabled}
                                                className={({ active, selected }) =>
                                                    twMerge(
                                                        'relative cursor-default select-none py-2 pl-10 pr-4',
                                                        active ? 'bg-blue-600 text-white' : 'text-gray-900',
                                                        optionDisabled && 'opacity-50 cursor-not-allowed'
                                                    )
                                                }
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        {renderOption ? (
                                                            renderOption(optionValue, { selected })
                                                        ) : (
                                                            <span className={twMerge(
                                                                'block truncate',
                                                                selected ? 'font-medium' : 'font-normal'
                                                            )}>
                                                                {optionLabel}
                                                            </span>
                                                        )}
                                                        {selected && (
                                                            <span className={twMerge(
                                                                'absolute inset-y-0 left-0 flex items-center pl-3',
                                                                active ? 'text-white' : 'text-blue-600'
                                                            )}>
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Combobox.Option>
                                        );
                                    })}
                                </Fragment>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </Combobox>

            {helperText && (
                <p className={helperTextClasses}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

// AutocompleteInput for react-admin compatibility
export const AutocompleteInput = Autocomplete;