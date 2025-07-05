import React, { useRef, useState } from 'react';

interface SliderProps {
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-valuenow'?: number;
    'aria-valuetext'?: string;
    className?: string;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    defaultValue?: number | number[];
    disabled?: boolean;
    getAriaLabel?: (index: number) => string;
    getAriaValueText?: (value: number, index: number) => string;
    marks?: boolean | Array<{ value: number; label?: string }>;
    max?: number;
    min?: number;
    name?: string;
    onChange?: (event: Event, value: number | number[]) => void;
    onChangeCommitted?: (event: Event, value: number | number[]) => void;
    orientation?: 'horizontal' | 'vertical';
    scale?: (value: number) => number;
    size?: 'small' | 'medium';
    step?: number;
    track?: 'normal' | 'inverted' | false;
    value?: number | number[];
    valueLabelDisplay?: 'on' | 'auto' | 'off';
    valueLabelFormat?: string | ((value: number, index: number) => React.ReactNode);
}

export const Slider: React.FC<SliderProps> = ({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-valuenow': ariaValuenow,
    'aria-valuetext': ariaValuetext,
    className = '',
    color = 'primary',
    defaultValue = 0,
    disabled = false,
    getAriaLabel,
    getAriaValueText,
    marks = false,
    max = 100,
    min = 0,
    name,
    onChange,
    onChangeCommitted,
    orientation = 'horizontal',
    scale,
    size = 'medium',
    step = 1,
    track = 'normal',
    value: valueProp,
    valueLabelDisplay = 'off',
    valueLabelFormat,
    ...props
}) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const sliderRef = useRef<HTMLDivElement>(null);

    const value = valueProp !== undefined ? valueProp : internalValue;
    const isArray = Array.isArray(value);
    const currentValue = isArray ? value[0] : value;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        const scaledValue = scale ? scale(newValue) : newValue;

        if (valueProp === undefined) {
            setInternalValue(scaledValue);
        }

        onChange?.(event as any, scaledValue);
    };

    const handleChangeCommitted = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(event.target.value);
        const scaledValue = scale ? scale(newValue) : newValue;
        onChangeCommitted?.(event as any, scaledValue);
    };

    const getColorClasses = () => {
        switch (color) {
            case 'primary': return 'accent-blue-600';
            case 'secondary': return 'accent-purple-600';
            case 'error': return 'accent-red-600';
            case 'info': return 'accent-cyan-600';
            case 'success': return 'accent-green-600';
            case 'warning': return 'accent-yellow-600';
            default: return 'accent-blue-600';
        }
    };

    const baseClasses = `
    w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
    ${getColorClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${size === 'small' ? 'h-1' : 'h-2'}
    ${className}
  `;

    const percentage = ((currentValue - min) / (max - min)) * 100;

    return (
        <div
            ref={sliderRef}
            className={`relative ${orientation === 'vertical' ? 'h-32 w-4' : 'w-full h-6'} flex items-center`}
            {...props}
        >
            {orientation === 'horizontal' ? (
                <div className="relative w-full">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={currentValue}
                        onChange={handleChange}
                        onMouseUp={handleChangeCommitted}
                        onTouchEnd={handleChangeCommitted}
                        disabled={disabled}
                        name={name}
                        className={baseClasses}
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledby}
                        aria-valuenow={ariaValuenow || currentValue}
                        aria-valuetext={ariaValuetext || getAriaValueText?.(currentValue, 0)}
                    />

                    {marks && Array.isArray(marks) && (
                        <div className="absolute top-full mt-1 w-full">
                            {marks.map((mark, index) => (
                                <div
                                    key={index}
                                    className="absolute text-xs text-gray-500 transform -translate-x-1/2"
                                    style={{ left: `${((mark.value - min) / (max - min)) * 100}%` }}
                                >
                                    {mark.label || mark.value}
                                </div>
                            ))}
                        </div>
                    )}

                    {valueLabelDisplay === 'on' && (
                        <div
                            className="absolute -top-8 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs"
                            style={{ left: `${percentage}%` }}
                        >
                            {typeof valueLabelFormat === 'function'
                                ? valueLabelFormat(currentValue, 0)
                                : valueLabelFormat || currentValue
                            }
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative h-full">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={currentValue}
                        onChange={handleChange}
                        onMouseUp={handleChangeCommitted}
                        onTouchEnd={handleChangeCommitted}
                        disabled={disabled}
                        name={name}
                        className={`${baseClasses} transform rotate-90 origin-center`}
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledby}
                        aria-valuenow={ariaValuenow || currentValue}
                        aria-valuetext={ariaValuetext || getAriaValueText?.(currentValue, 0)}
                    />
                </div>
            )}
        </div>
    );
};

export default Slider; 