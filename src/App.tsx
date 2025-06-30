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
        // Determine authentication mode based on environment configuration
        const determineAuthMode = () => {
            // Check URL parameters for override (useful for testing)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'demo') {
                return 'demo';
            }
            if (urlParams.get('mode') === 'jwt') {
                return 'jwt';
            }

            // Use VITE_IS_DEMO environment variable
            return import.meta.env.VITE_IS_DEMO === 'true' ? 'demo' : 'jwt';
        };

        const mode = determineAuthMode();
        setAuthMode(mode);

        console.log(`🔧 ForkFlow CRM starting in ${mode.toUpperCase()} mode`);
        console.log('🔧 Environment Check:', {
            VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
            VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing',
            VITE_IS_DEMO: import.meta.env.VITE_IS_DEMO,
            NODE_ENV: import.meta.env.NODE_ENV
        });
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
