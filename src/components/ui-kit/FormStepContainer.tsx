import React, { ErrorInfo } from 'react';
import { cn } from '../../utils/cn';
import { Alert } from './Alert';
import { CircularProgress } from './CircularProgress';
import { Typography } from './Typography';

interface FormStepContainerProps {
    children: React.ReactNode;
    isActive?: boolean;
    isLoading?: boolean;
    error?: string | null;
    title?: string;
    description?: string;
    className?: string;
    onRetry?: () => void;
}

interface FormStepContainerState {
    hasError: boolean;
    error?: Error;
}

/**
 * Error boundary and container for form steps
 * Provides consistent styling and error handling
 */
class FormStepErrorBoundary extends React.Component<
    { children: React.ReactNode; onRetry?: () => void },
    FormStepContainerState
> {
    constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): FormStepContainerState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('FormStepContainer Error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 text-center">
                    <Alert severity="error" className="mb-4">
                        <div>
                            <Typography variant="subtitle2" className="font-medium">
                                Something went wrong in this step
                            </Typography>
                            <Typography variant="body2" className="mt-1 text-gray-600">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </Typography>
                        </div>
                    </Alert>
                    
                    {this.props.onRetry && (
                        <button
                            onClick={this.handleRetry}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            );
        }

        return <>{this.props.children}</>;
    }
}

/**
 * Container wrapper for form steps with consistent styling and error handling
 * Extracted from MultiStepOrganizationEdit for reuse
 */
export const FormStepContainer: React.FC<FormStepContainerProps> = ({
    children,
    isActive = true,
    isLoading = false,
    error,
    title,
    description,
    className,
    onRetry,
}) => {
    return (
        <div
            className={cn(
                'transition-all duration-300 ease-in-out',
                isActive ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4 pointer-events-none',
                className
            )}
        >
            {/* Step Header */}
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <Typography variant="h6" className="text-gray-900 mb-2">
                            {title}
                        </Typography>
                    )}
                    {description && (
                        <Typography variant="body2" className="text-gray-600">
                            {description}
                        </Typography>
                    )}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <Alert severity="error" className="mb-6">
                    <div>
                        <Typography variant="subtitle2" className="font-medium">
                            Error in this step
                        </Typography>
                        <Typography variant="body2" className="mt-1">
                            {error}
                        </Typography>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Retry
                        </button>
                    )}
                </Alert>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <CircularProgress size="md" />
                    <Typography variant="body2" className="ml-3 text-gray-600">
                        Validating step...
                    </Typography>
                </div>
            )}

            {/* Step Content with Error Boundary */}
            {!isLoading && (
                <FormStepErrorBoundary onRetry={onRetry}>
                    <div className="space-y-6">
                        {children}
                    </div>
                </FormStepErrorBoundary>
            )}
        </div>
    );
};