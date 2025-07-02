import { Admin, Resource, Layout, Loading } from 'react-admin';
import { AuthProvider } from 'react-admin';
import { dataProvider as fakeDataProvider } from './providers/fakerest/dataProvider';
import { authProvider as fakeAuthProvider } from './providers/fakerest/authProvider';
import { LoginPage } from './login/LoginPage';
import { UniversalLoginPage } from './login/UniversalLoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CRM } from './root/CRM';

// Force demo auth provider to always resolve without data provider dependency
const simpleDemoAuthProvider: AuthProvider = {
    login: async ({ email, password }) => {
        console.log('🔐 simpleDemoAuthProvider.login called with:', { email, password: '***' });
        // Accept any demo credentials
        if (email && password) {
            const userData = {
                id: 'demo-user',
                email: email,
                fullName: 'Demo User',
                role: 'admin'
            };
            localStorage.setItem('demo-user', JSON.stringify(userData));
            console.log('✅ simpleDemoAuthProvider.login: User logged in successfully');
            return Promise.resolve();
        }
        console.error('❌ simpleDemoAuthProvider.login: Missing credentials');
        throw new Error('Please enter demo credentials');
    },
    logout: () => {
        console.log('🚪 simpleDemoAuthProvider.logout called');
        localStorage.removeItem('demo-user');
        return Promise.resolve();
    },
    checkError: () => {
        console.log('🔍 simpleDemoAuthProvider.checkError called');
        return Promise.resolve();
    },
    checkAuth: () => {
        console.log('🔐 simpleDemoAuthProvider.checkAuth called');
        const user = localStorage.getItem('demo-user');
        if (user) {
            console.log('✅ simpleDemoAuthProvider.checkAuth: User authenticated');
            return Promise.resolve();
        } else {
            console.log('❌ simpleDemoAuthProvider.checkAuth: User not authenticated');
            return Promise.reject(new Error('Not authenticated'));
        }
    },
    getIdentity: () => {
        console.log('👤 simpleDemoAuthProvider.getIdentity called');
        const userString = localStorage.getItem('demo-user');
        const user = userString ? JSON.parse(userString) : null;
        const identity = {
            id: user?.id || 'demo-user',
            fullName: user?.fullName || 'Demo User',
            email: user?.email || 'demo@forkflow.com'
        };
        console.log('👤 simpleDemoAuthProvider.getIdentity returning:', identity);
        return Promise.resolve(identity);
    },
    getPermissions: () => {
        console.log('🔑 simpleDemoAuthProvider.getPermissions called');
        return Promise.resolve(['admin']);
    },
};


const Demo = () => {
    console.log('🆕 DEBUG: Demo.tsx Starting render - Enhanced debugging');
    
    // Enhanced localStorage clearing strategy - only clear auth tokens
    if (typeof window !== 'undefined') {
        console.log('🧹 Demo.tsx: Clearing only auth-related localStorage items');
        
        // Store current localStorage for debugging
        const beforeClear = { ...localStorage };
        console.log('📋 localStorage BEFORE clearing:', beforeClear);
        
        // Only clear auth-related items, not everything
        localStorage.removeItem('demo-user');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('RaStore.auth');
        
        // Set demo mode markers
        localStorage.setItem('test-mode', 'true');
        localStorage.setItem('data-provider', 'fakerest');
        
        const afterClear = { ...localStorage };
        console.log('📋 localStorage AFTER selective clearing:', afterClear);
        console.log('✅ Demo.tsx: Selective localStorage cleanup complete');
    }
    
    // Debug auth provider state
    console.log('🔐 Demo.tsx: Testing simpleDemoAuthProvider.checkAuth()');
    simpleDemoAuthProvider.checkAuth({ signal: new AbortController().signal })
        .then(() => {
            console.log('✅ Demo.tsx: checkAuth RESOLVED - user is authenticated');
        })
        .catch((error) => {
            console.log('❌ Demo.tsx: checkAuth REJECTED - user NOT authenticated (this is expected)', error?.message);
        });
    
    console.log('🎯 Demo.tsx: About to render CRM component with enhanced error boundary');
    console.log('📊 Demo.tsx: CRM Props:', {
        title: "ForkFlow CRM - Demo Mode",
        authProvider: 'simpleDemoAuthProvider',
        dataProvider: 'fakeDataProvider', 
        requireAuth: true,
        enableGPS: false
    });
    
    return (
        <ErrorBoundary>
            <CRM
                title="ForkFlow CRM - Demo Mode"
                authProvider={simpleDemoAuthProvider}
                dataProvider={fakeDataProvider}
                requireAuth={true}
                enableGPS={false}
            />
        </ErrorBoundary>
    );
};

export default Demo;
