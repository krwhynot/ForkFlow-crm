import React from 'react';
import { useFormControl } from './FormControl';

interface InputLabelProps {
    children?: React.ReactNode;
    className?: string;
    component?: React.ElementType;
    disabled?: boolean;
    error?: boolean;
    focused?: boolean;
    required?: boolean;
    shrink?: boolean;
    size?: 'small' | 'normal';
    variant?: 'standard' | 'outlined' | 'filled';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    htmlFor?: string;
}

export const InputLabel: React.FC<InputLabelProps> = ({
    children,
    className = '',
    component: Component = 'label',
    disabled: disabledProp,
    error: errorProp,
    focused = false,
    required: requiredProp,
    shrink = false,
    size = 'normal',
    variant = 'outlined',
    color = 'primary',
    htmlFor,
    ...props
}) => {
    const formControl = useFormControl();

    const disabled = disabledProp ?? formControl.disabled ?? false;
    const error = errorProp ?? formControl.error ?? false;
    const required = requiredProp ?? formControl.required ?? false;
    const formControlSize = formControl.size ?? size;

    const getColorClasses = () => {
        if (error) return 'text-red-600';
        if (focused) {
            switch (color) {
                case 'primary': return 'text-blue-600';
                case 'secondary': return 'text-purple-600';
                case 'error': return 'text-red-600';
                case 'info': return 'text-cyan-600';
                case 'success': return 'text-green-600';
                case 'warning': return 'text-yellow-600';
                default: return 'text-blue-600';
            }
        }
        return 'text-gray-700';
    };

    const baseClasses = `
    block font-medium transition-colors duration-200
    ${formControlSize === 'small' ? 'text-sm' : 'text-base'}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${shrink ? 'transform scale-75 -translate-y-1' : ''}
    ${getColorClasses()}
    ${className}
  `;

    return (
        <Component className={baseClasses.trim()} htmlFor={htmlFor} {...props}>
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </Component>
    );
};

export default InputLabel; 