import React from 'react';
import { twMerge } from 'tailwind-merge';
import { useFormControl } from './FormControl';

interface FormHelperTextProps extends React.HTMLAttributes<HTMLElement> {
    component?: React.ElementType;
    error?: boolean;
    disabled?: boolean;
}

/**
 * FormHelperText component replicates Material-UI's helper text behaviour.
 * It consumes FormControl context to derive `error` and `disabled` state when
 * those props are not explicitly provided, and adjusts styling accordingly.
 */
export const FormHelperText: React.FC<FormHelperTextProps> = ({
    component: Component = 'p',
    error: errorProp,
    disabled: disabledProp,
    children,
    className,
    ...props
}) => {
    const formControl = useFormControl();

    const error = errorProp ?? formControl.error ?? false;
    const disabled = disabledProp ?? formControl.disabled ?? false;

    const classes = twMerge(
        'text-xs mt-1',
        disabled && 'opacity-50',
        error ? 'text-red-600' : 'text-gray-600',
        className
    );

    if (!children) return null;

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
};

export default FormHelperText; 