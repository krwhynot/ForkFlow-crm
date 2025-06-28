import { CRM } from './root/CRM';
import { AuthProvider } from 'react-admin';
import { dataProvider } from './providers/fakerest';

// Simple auth provider that always allows access
const demoAuthProvider: AuthProvider = {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(), // Always allow access
    getIdentity: () =>
        Promise.resolve({
            id: 'demo-user',
            fullName: 'Demo User',
        }),
    getPermissions: () => Promise.resolve(), // Required by react-admin
};

const Demo = () => (
    <CRM
        title="ForkFlow Food Broker CRM - Demo"
        enableGPS={true}
        dataProvider={dataProvider}
        authProvider={demoAuthProvider}
        requireAuth={false}
    />
);

export default Demo;
