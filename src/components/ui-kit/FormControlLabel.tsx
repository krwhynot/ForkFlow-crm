import React from 'react';
import { cn } from '../../utils/cn';

interface FormControlLabelProps {
    label: React.ReactNode;
    control: React.ReactElement;
    className?: string;
    labelPlacement?: 'end' | 'start';
}

/**
 * Simple FormControlLabel alternative – aligns a control (checkbox/switch) with a label.
 */
export const FormControlLabel: React.FC<FormControlLabelProps> = ({
    label,
    control,
    className,
    labelPlacement = 'end',
}) => {
    return (
        <label
            className={cn(
                'inline-flex items-center space-x-2 text-sm',
                labelPlacement === 'start' && 'flex-row-reverse space-x-reverse',
                className
            )}
        >
            {control}
            <span>{label}</span>
        </label>
    );
};

export default FormControlLabel; 