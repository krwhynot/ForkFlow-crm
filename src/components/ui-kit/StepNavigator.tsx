import React from 'react';
import {
    CheckIcon,
    ExclamationCircleIcon as ErrorIcon,
    ExclamationTriangleIcon as WarningIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { FormStep, StepState } from '../../hooks/useMultiStepForm';
import { Typography } from './Typography';
import { Chip } from './Chip';

interface StepNavigatorProps<T = any> {
    steps: FormStep<T>[];
    activeStep: number;
    stepStates: Record<number, StepState>;
    onStepClick?: (stepIndex: number) => void;
    progress?: number;
    orientation?: 'horizontal' | 'vertical';
    showProgress?: boolean;
    showDescriptions?: boolean;
    showStatusChips?: boolean;
    className?: string;
}

/**
 * Reusable step navigator component for multi-step forms
 * Extracted from MultiStepOrganizationEdit for broader use
 */
export function StepNavigator<T = any>({
    steps,
    activeStep,
    stepStates,
    onStepClick,
    progress,
    orientation = 'horizontal',
    showProgress = true,
    showDescriptions = true,
    showStatusChips = true,
    className,
}: StepNavigatorProps<T>) {
    // Get step status icon
    const getStepIcon = (stepIndex: number) => {
        const state = stepStates[stepIndex];
        const isActive = stepIndex === activeStep;
        
        if (state.completed) {
            return <CheckIcon className="h-5 w-5 text-green-600" />;
        }
        if (state.hasErrors) {
            return <ErrorIcon className="h-5 w-5 text-red-600" />;
        }
        if (state.warningCount > 0) {
            return <WarningIcon className="h-5 w-5 text-yellow-600" />;
        }
        
        return (
            <span className={cn(
                "w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium",
                isActive 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-300 text-gray-700"
            )}>
                {stepIndex + 1}
            </span>
        );
    };

    // Get step status classes
    const getStepClasses = (stepIndex: number) => {
        const state = stepStates[stepIndex];
        const isActive = stepIndex === activeStep;
        const isCompleted = state.completed;
        
        return cn(
            "transition-all duration-200",
            isActive && "ring-2 ring-blue-500 ring-opacity-50",
            state.hasErrors && "border-red-200",
            isCompleted && !isActive && "border-green-200"
        );
    };

    if (orientation === 'vertical') {
        return (
            <div className={cn("space-y-4", className)}>
                {/* Progress bar */}
                {showProgress && progress !== undefined && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <Typography variant="caption" className="text-gray-600">
                                Progress
                            </Typography>
                            <Typography variant="caption" className="text-gray-600">
                                {Math.round(progress)}%
                            </Typography>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Steps */}
                {steps.map((step, index) => {
                    const state = stepStates[index];
                    const isActive = index === activeStep;
                    const isCompleted = state.completed;

                    return (
                        <div key={step.id} className="relative">
                            <button
                                onClick={() => onStepClick?.(index)}
                                disabled={!onStepClick}
                                className={cn(
                                    "w-full text-left p-4 rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                    getStepClasses(index),
                                    !onStepClick && "cursor-default"
                                )}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStepIcon(index)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <Typography 
                                                variant="subtitle2" 
                                                className={cn(
                                                    isActive ? 'text-blue-900' : 
                                                    isCompleted ? 'text-green-900' : 
                                                    'text-gray-900'
                                                )}
                                            >
                                                {step.icon} {step.label}
                                            </Typography>
                                        </div>
                                        
                                        {showDescriptions && (
                                            <Typography variant="caption" className="text-gray-600 block mt-1">
                                                {step.description}
                                            </Typography>
                                        )}
                                        
                                        {showStatusChips && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {state.hasChanges && (
                                                    <Chip
                                                        label="Modified"
                                                        size="small"
                                                        className="bg-blue-100 text-blue-800 border border-blue-200"
                                                    />
                                                )}
                                                {state.errorCount > 0 && (
                                                    <Chip
                                                        label={`${state.errorCount} error${state.errorCount > 1 ? 's' : ''}`}
                                                        size="small"
                                                        className="bg-red-100 text-red-800 border border-red-200"
                                                    />
                                                )}
                                                {state.warningCount > 0 && (
                                                    <Chip
                                                        label={`${state.warningCount} warning${state.warningCount > 1 ? 's' : ''}`}
                                                        size="small"
                                                        className="bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                            
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-6 top-16 bottom-0 w-px bg-gray-300" />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Horizontal layout
    return (
        <div className={cn("space-y-4", className)}>
            {/* Progress bar */}
            {showProgress && progress !== undefined && (
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Typography variant="caption" className="text-gray-600">
                            Step {activeStep + 1} of {steps.length}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                            {Math.round(progress)}% Complete
                        </Typography>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Steps */}
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const state = stepStates[index];
                    const isActive = index === activeStep;
                    const isCompleted = state.completed;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => onStepClick?.(index)}
                                    disabled={!onStepClick}
                                    className={cn(
                                        "p-3 rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                                        getStepClasses(index),
                                        !onStepClick && "cursor-default"
                                    )}
                                >
                                    <div className="flex flex-col items-center space-y-2">
                                        {getStepIcon(index)}
                                        <div className="text-center">
                                            <Typography 
                                                variant="caption" 
                                                className={cn(
                                                    "font-medium",
                                                    isActive ? 'text-blue-900' : 
                                                    isCompleted ? 'text-green-900' : 
                                                    'text-gray-900'
                                                )}
                                            >
                                                {step.label}
                                            </Typography>
                                            {showDescriptions && (
                                                <Typography variant="caption" className="text-gray-500 block">
                                                    {step.description}
                                                </Typography>
                                            )}
                                        </div>
                                        
                                        {showStatusChips && (
                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {state.hasChanges && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                )}
                                                {state.errorCount > 0 && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                                )}
                                                {state.warningCount > 0 && (
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                            
                            {/* Arrow connector */}
                            {index < steps.length - 1 && (
                                <div className="flex-shrink-0 mx-2">
                                    <ArrowRightIcon className={cn(
                                        "h-5 w-5",
                                        index < activeStep ? 'text-green-600' : 'text-gray-400'
                                    )} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}