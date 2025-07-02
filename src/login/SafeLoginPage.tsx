/**
 * Safe Login Page Wrapper
 * Attempts to render UniversalLoginPage, falls back to FallbackLoginPage if it fails
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { UniversalLoginPage } from './UniversalLoginPage';
import { FallbackLoginPage } from './FallbackLoginPage';

// Custom Error Boundary for login page with fallback
interface LoginErrorBoundaryProps {
    children: ReactNode;
    onError: (error: Error) => void;
    fallback: ReactNode;
}

interface LoginErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class LoginErrorBoundary extends Component<LoginErrorBoundaryProps, LoginErrorBoundaryState> {
    constructor(props: LoginErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): LoginErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 LoginErrorBoundary: Caught error in login page', error, errorInfo);
        this.props.onError(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }

        return this.props.children;
    }
}

interface SafeLoginPageProps {
    // Any props that might be passed to login pages
    [key: string]: any;
}

export const SafeLoginPage: React.FC<SafeLoginPageProps> = (props) => {
    const [useFallback, setUseFallback] = useState(false);
    const [error, setError] = useState<string>('');

    console.log('🔐 SafeLoginPage: Rendering with fallback safety', { useFallback });

    // If we need to force fallback mode (for testing)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('fallback') === 'true') {
            console.log('🔐 SafeLoginPage: Fallback mode forced via URL parameter');
            setUseFallback(true);
        }
    }, []);

    const handleUniversalPageError = (error: Error) => {
        console.error('🚨 SafeLoginPage: UniversalLoginPage failed, switching to fallback', error);
        setError(`Main login page failed: ${error.message}`);
        setUseFallback(true);
    };

    if (useFallback) {
        console.log('🔐 SafeLoginPage: Using FallbackLoginPage');
        return <FallbackLoginPage error={error} {...props} />;
    }

    console.log('🔐 SafeLoginPage: Attempting UniversalLoginPage');

    return (
        <LoginErrorBoundary
            onError={handleUniversalPageError}
            fallback={<FallbackLoginPage error={error} {...props} />}
        >
            <UniversalLoginPage {...props} />
        </LoginErrorBoundary>
    );
};

// Also export a simple version for direct testing
export const SimpleSafeLoginPage: React.FC<SafeLoginPageProps> = (props) => {
    console.log('🔐 SimpleSafeLoginPage: Directly using FallbackLoginPage (test mode)');
    return <FallbackLoginPage {...props} />;
};