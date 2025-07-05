import React from 'react';

interface FormControlProps {
    children?: React.ReactNode;
    className?: string;
    component?: React.ElementType;
    disabled?: boolean;
    error?: boolean;
    fullWidth?: boolean;
    margin?: 'none' | 'dense' | 'normal';
    required?: boolean;
    size?: 'small' | 'medium';
    variant?: 'standard' | 'outlined' | 'filled';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

export const FormControl: React.FC<FormControlProps> = ({
    children,
    className = '',
    component: Component = 'div',
    disabled = false,
    error = false,
    fullWidth = false,
    margin = 'normal',
    required = false,
    size = 'medium',
    variant = 'outlined',
    color = 'primary',
    ...props
}) => {
    const baseClasses = `
    ${fullWidth ? 'w-full' : ''}
    ${margin === 'dense' ? 'mb-2' : margin === 'normal' ? 'mb-4' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${error ? 'text-red-600' : ''}
    ${className}
  `;

    const contextValue = {
        disabled,
        error,
        fullWidth,
        margin,
        required,
        size,
        variant,
        color,
    };

    return (
        <FormControlContext.Provider value={contextValue}>
            <Component className={baseClasses.trim()} {...props}>
                {children}
            </Component>
        </FormControlContext.Provider>
    );
};

// Create a context for form control state
export const FormControlContext = React.createContext<{
    disabled?: boolean;
    error?: boolean;
    fullWidth?: boolean;
    margin?: 'none' | 'dense' | 'normal';
    required?: boolean;
    size?: 'small' | 'medium';
    variant?: 'standard' | 'outlined' | 'filled';
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}>({});

// Hook to use form control context
export const useFormControl = () => {
    return React.useContext(FormControlContext);
};

export default FormControl; 