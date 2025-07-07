import React, { useState } from 'react';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { FormStep, StepState } from '../../hooks/useMultiStepForm';
import { Typography } from './Typography';
import { Button } from './Button';
import { Collapse } from './Collapse';

interface StepValidationSummaryProps<T = any> {
    steps: FormStep<T>[];
    stepStates: Record<number, StepState>;
    validationErrors: Record<string, string>;
    onStepClick?: (stepIndex: number) => void;
    showDetailedErrors?: boolean;
    className?: string;
}

/**
 * Validation summary component showing overall form status
 * Extracted from MultiStepOrganizationEdit for reuse
 */
export function StepValidationSummary<T = any>({
    steps,
    stepStates,
    validationErrors,
    onStepClick,
    showDetailedErrors = true,
    className,
}: StepValidationSummaryProps<T>) {
    const [expanded, setExpanded] = useState(false);

    // Calculate overall status
    const totalSteps = steps.length;
    const completedSteps = Object.values(stepStates).filter(state => state.completed).length;
    const stepsWithErrors = Object.values(stepStates).filter(state => state.hasErrors).length;
    const stepsWithWarnings = Object.values(stepStates).filter(state => state.warningCount > 0).length;
    const totalErrors = Object.values(stepStates).reduce((sum, state) => sum + state.errorCount, 0);
    const totalWarnings = Object.values(stepStates).reduce((sum, state) => sum + state.warningCount, 0);

    const isFormValid = stepsWithErrors === 0;
    const isFormComplete = completedSteps === totalSteps;

    // Get overall status
    const getOverallStatus = () => {
        if (stepsWithErrors > 0) return 'error';
        if (stepsWithWarnings > 0) return 'warning';
        if (isFormComplete) return 'success';
        return 'info';
    };

    const overallStatus = getOverallStatus();

    // Status styling
    const statusStyles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: CheckCircleIcon,
            iconColor: 'text-green-600',
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: ExclamationCircleIcon,
            iconColor: 'text-red-600',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            icon: ExclamationTriangleIcon,
            iconColor: 'text-yellow-600',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: ExclamationCircleIcon,
            iconColor: 'text-blue-600',
        },
    };

    const style = statusStyles[overallStatus];
    const StatusIcon = style.icon;

    return (
        <div className={cn('rounded-lg border p-4', style.bg, style.border, className)}>
            {/* Summary Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <StatusIcon className={cn('h-5 w-5 mt-0.5', style.iconColor)} />
                    <div className="flex-1">
                        <Typography variant="subtitle2" className={cn('font-medium', style.text)}>
                            {overallStatus === 'success' && 'Form Complete'}
                            {overallStatus === 'error' && 'Form Has Errors'}
                            {overallStatus === 'warning' && 'Form Has Warnings'}
                            {overallStatus === 'info' && 'Form In Progress'}
                        </Typography>
                        
                        <div className="mt-1 space-y-1">
                            <Typography variant="caption" className={style.text}>
                                {completedSteps} of {totalSteps} steps completed
                            </Typography>
                            
                            {totalErrors > 0 && (
                                <Typography variant="caption" className="text-red-600 block">
                                    {totalErrors} error{totalErrors > 1 ? 's' : ''} across {stepsWithErrors} step{stepsWithErrors > 1 ? 's' : ''}
                                </Typography>
                            )}
                            
                            {totalWarnings > 0 && (
                                <Typography variant="caption" className="text-yellow-600 block">
                                    {totalWarnings} warning{totalWarnings > 1 ? 's' : ''} across {stepsWithWarnings} step{stepsWithWarnings > 1 ? 's' : ''}
                                </Typography>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expand/Collapse Button */}
                {showDetailedErrors && (totalErrors > 0 || totalWarnings > 0) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                        className="ml-2"
                    >
                        {expanded ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* Detailed Errors */}
            {showDetailedErrors && (
                <Collapse in={expanded}>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                            {steps.map((step, stepIndex) => {
                                const state = stepStates[stepIndex];
                                if (state.errorCount === 0 && state.warningCount === 0) return null;

                                return (
                                    <div key={step.id} className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Typography variant="caption" className="font-medium text-gray-900">
                                                {step.icon} {step.label}
                                            </Typography>
                                            
                                            <div className="mt-1 space-y-1">
                                                {state.errorCount > 0 && (
                                                    <Typography variant="caption" className="text-red-600 block">
                                                        {state.errorCount} error{state.errorCount > 1 ? 's' : ''}
                                                    </Typography>
                                                )}
                                                {state.warningCount > 0 && (
                                                    <Typography variant="caption" className="text-yellow-600 block">
                                                        {state.warningCount} warning{state.warningCount > 1 ? 's' : ''}
                                                    </Typography>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {onStepClick && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onStepClick(stepIndex)}
                                                className="text-xs"
                                            >
                                                Fix Issues
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Collapse>
            )}
        </div>
    );
}