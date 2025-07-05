import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Stepper Component
 * Replaces Material-UI Stepper with Tailwind CSS styling
 * Supports both horizontal and vertical orientations
 * Mobile-responsive with 44px minimum touch targets
 */

interface StepperProps {
    activeStep: number;
    orientation?: 'horizontal' | 'vertical';
    children: React.ReactNode;
    className?: string;
}

interface StepProps {
    completed?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    stepIndex?: number;
}

interface StepLabelProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    error?: boolean;
    optional?: React.ReactNode;
    className?: string;
}

interface StepContentProps {
    children: React.ReactNode;
    className?: string;
}

const StepperContext = React.createContext<{
    activeStep: number;
    orientation: 'horizontal' | 'vertical';
}>({
    activeStep: 0,
    orientation: 'horizontal',
});

export const Stepper: React.FC<StepperProps> = ({
    activeStep,
    orientation = 'horizontal',
    children,
    className,
}) => {
    const contextValue = React.useMemo(
        () => ({
            activeStep,
            orientation,
        }),
        [activeStep, orientation]
    );

    return (
        <StepperContext.Provider value={contextValue}>
            <div
                className={twMerge(
                    'flex',
                    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
                    className
                )}
                role="tablist"
                aria-orientation={orientation}
            >
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            ...child.props,
                            stepIndex: index,
                        });
                    }
                    return child;
                })}
            </div>
        </StepperContext.Provider>
    );
};

export const Step: React.FC<StepProps> = ({
    completed = false,
    disabled = false,
    onClick,
    children,
    className,
    stepIndex = 0,
}) => {
    const { activeStep, orientation } = React.useContext(StepperContext);
    const isActive = stepIndex === activeStep;
    const isCompleted = completed;
    const isDisabled = disabled;

    const handleClick = () => {
        if (!isDisabled && onClick) {
            onClick();
        }
    };

    return (
        <div
            className={twMerge(
                'flex',
                orientation === 'horizontal' ? 'flex-col items-center' : 'flex-row',
                'relative',
                onClick && !isDisabled && 'cursor-pointer',
                className
            )}
            onClick={handleClick}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
        >
            {/* Connector line */}
            {orientation === 'horizontal' && stepIndex > 0 && (
                <div
                    className={twMerge(
                        'absolute top-6 left-0 w-full h-0.5 -translate-x-1/2',
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    )}
                    style={{ left: '-50%' }}
                />
            )}
            {orientation === 'vertical' && stepIndex > 0 && (
                <div
                    className={twMerge(
                        'absolute left-6 top-0 w-0.5 h-full -translate-y-full',
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    )}
                    style={{ top: '-50%' }}
                />
            )}
            {children}
        </div>
    );
};

export const StepLabel: React.FC<StepLabelProps> = ({
    children,
    icon,
    error = false,
    optional,
    className,
}) => {
    const { activeStep, orientation } = React.useContext(StepperContext);
    const stepIndex = React.useRef(0);

    const isActive = stepIndex.current === activeStep;
    const isCompleted = stepIndex.current < activeStep;

    React.useEffect(() => {
        stepIndex.current = stepIndex.current + 1;
    }, []);

    return (
        <div
            className={twMerge(
                'flex items-center gap-3',
                orientation === 'horizontal' ? 'flex-col text-center' : 'flex-row',
                className
            )}
        >
            {/* Step icon/number */}
            <div
                className={twMerge(
                    'flex items-center justify-center',
                    'w-12 h-12 rounded-full border-2 transition-all',
                    'min-w-[44px] min-h-[44px]', // Touch-friendly
                    isActive && 'border-blue-500 bg-blue-50',
                    isCompleted && 'border-green-500 bg-green-50',
                    error && 'border-red-500 bg-red-50',
                    !isActive && !isCompleted && !error && 'border-gray-300 bg-gray-50'
                )}
            >
                {icon ? (
                    <div
                        className={twMerge(
                            'text-sm',
                            isActive && 'text-blue-600',
                            isCompleted && 'text-green-600',
                            error && 'text-red-600',
                            !isActive && !isCompleted && !error && 'text-gray-600'
                        )}
                    >
                        {icon}
                    </div>
                ) : (
                    <span
                        className={twMerge(
                            'text-sm font-medium',
                            isActive && 'text-blue-600',
                            isCompleted && 'text-green-600',
                            error && 'text-red-600',
                            !isActive && !isCompleted && !error && 'text-gray-600'
                        )}
                    >
                        {stepIndex.current + 1}
                    </span>
                )}
            </div>

            {/* Step content */}
            <div
                className={twMerge(
                    'flex-1',
                    orientation === 'horizontal' ? 'text-center' : 'text-left'
                )}
            >
                <div
                    className={twMerge(
                        'text-sm font-medium',
                        isActive && 'text-blue-900',
                        isCompleted && 'text-green-900',
                        error && 'text-red-900',
                        !isActive && !isCompleted && !error && 'text-gray-900'
                    )}
                >
                    {children}
                </div>
                {optional && (
                    <div className="mt-1 text-xs text-gray-500">{optional}</div>
                )}
            </div>
        </div>
    );
};

export const StepContent: React.FC<StepContentProps> = ({
    children,
    className,
}) => {
    return (
        <div
            className={twMerge(
                'mt-4 ml-16', // Offset for vertical stepper
                'transition-all duration-200',
                className
            )}
        >
            {children}
        </div>
    );
};

export default Stepper;