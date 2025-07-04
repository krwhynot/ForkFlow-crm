import { FC } from 'react';
import { Organization } from '../../../types';

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error';
}

export interface ValidationWarning {
    field: string;
    message: string;
    severity: 'warning';
}

export interface StepValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface StepComponentProps {
    formData: Partial<Organization>;
    onDataChange: (data: Partial<Organization>) => void;
    validationErrors: Record<string, string>;
    isMobile: boolean;
}

export interface FormStep {
    id: string;
    label: string;
    description: string;
    icon: string;
    component: FC<StepComponentProps>;
    validate?: (data: Partial<Organization>) => Promise<StepValidationResult>;
    required: boolean;
}
