import { useEffect, useState } from 'react';
import { CRM } from './root/CRM';
import { dataProvider } from './providers/supabase';
import { jwtAuthProvider } from './providers/auth';
import Demo from './Demo';

/**
 * ForkFlow Food Broker CRM Application Entry Point
 * 
 * Intelligently switches between demo mode and production JWT authentication
 * based on environment configuration and URL parameters.
 */
const App = () => {
    const [authMode, setAuthMode] = useState<'demo' | 'jwt' | 'loading'>('loading');

    useEffect(() => {
        // Determine authentication mode based on various factors
        const determineAuthMode = () => {
            // Check URL parameters first
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'demo') {
                return 'demo';
            }
            if (urlParams.get('mode') === 'jwt' || urlParams.get('auth') === 'jwt') {
                return 'jwt';
            }

            // Check localStorage configuration
            const storedMode = localStorage.getItem('forkflow-auth-mode');
            if (storedMode === 'demo' || storedMode === 'jwt') {
                return storedMode;
            }

            // Check environment variables
            if (process.env.REACT_APP_AUTH_MODE === 'demo') {
                return 'demo';
            }
            if (process.env.REACT_APP_AUTH_MODE === 'jwt') {
                return 'jwt';
            }

            // Default to JWT for production, demo for development
            return process.env.NODE_ENV === 'production' ? 'jwt' : 'demo';
        };

        const mode = determineAuthMode();
        setAuthMode(mode);

        // Store the determined mode for consistency
        localStorage.setItem('forkflow-auth-mode', mode);

        console.log(`🔧 ForkFlow CRM starting in ${mode.toUpperCase()} mode`);
    }, []);

    // Show loading state while determining auth mode
    if (authMode === 'loading') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontFamily: 'Roboto, sans-serif',
                color: '#666',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>🍽️</div>
                    <div>Loading ForkFlow CRM...</div>
                </div>
            </div>
        );
    }

    // Render demo mode
    if (authMode === 'demo') {
        return <Demo />;
    }

    // Render production JWT mode
    return (
        <CRM
            title="ForkFlow Food Broker CRM"
            enableGPS={true}
            dataProvider={dataProvider}
            authProvider={jwtAuthProvider}
            requireAuth={true}
        />
    );
};

export default App;
