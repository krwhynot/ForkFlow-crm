import { CRM } from './root/CRM';
import { dataProvider } from './providers/fakerest';
import { jwtAuthProvider } from './providers/auth';

/**
 * JWT Authentication Demo
 *
 * This demo shows the ForkFlow CRM with JWT authentication enabled.
 * Uses fake data provider for testing but real JWT auth flows.
 *
 * Test credentials:
 * - admin@forkflow.com / Admin123!
 * - manager@forkflow.com / Manager123!
 * - broker@forkflow.com / Broker123!
 * - demo@forkflow.com / Demo123!
 */
const JWTDemo = () => (
    <CRM
        title="ForkFlow Food Broker CRM - JWT Demo"
        enableGPS={true}
        dataProvider={dataProvider}
        authProvider={jwtAuthProvider}
        requireAuth={true}
    />
);

export default JWTDemo;
