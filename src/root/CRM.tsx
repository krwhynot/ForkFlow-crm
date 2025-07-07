import { ForgotPasswordPage, SetPasswordPage } from 'ra-supabase';
import { useEffect } from 'react';
import type { AdminProps, AuthProvider, DataProvider } from 'react-admin';
import {
    Admin,
    CustomRoutes,
    ListGuesser,
    RaThemeOptions,
    Resource,
    localStorageStore
} from 'react-admin';
import { Route } from 'react-router';

import contacts from '../contacts';
import { HomeDashboard } from '../dashboard/HomeDashboard';
import interactions from '../interactions';
import Layout from '../layout/Layout';
import { SignupPage } from '../login/SignupPage';
import { UniversalLoginPage } from '../login/UniversalLoginPage';
import opportunities from '../opportunities';
import organizations from '../organizations';
import products from '../products';
import {
    authProvider as fakerestAuthProvider,
    dataProvider as fakerestDataProvider,
} from '../providers/fakerest';
import {
    authProvider as supabaseAuthProvider,
    dataProvider as supabaseDataProvider,
} from '../providers/supabase';
import sales from '../sales';
import { SettingsPage } from '../settings/SettingsPage';
import { ReportsPage } from '../components/reports';
import {
    ConfigurationContextValue,
    ConfigurationProvider,
} from './ConfigurationContext';
import {
    defaultCompanySectors,
    defaultContactGender,
    defaultLogo,
    defaultNoteStatuses,
    defaultTaskTypes,
    defaultTitle,
} from './defaultConfiguration';
import { i18nProvider } from './i18nProvider';

// Simple development auth provider that bypasses authentication
const devAuthProvider: AuthProvider = {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    checkError: () => Promise.resolve(),
    checkAuth: () => Promise.resolve(),
    getPermissions: () => Promise.resolve(),
    getIdentity: () => Promise.resolve({
        id: 'demo-user',
        fullName: 'Demo User',
        email: 'demo@forkflow.com',
        role: 'broker',
        avatar: null,
    }),
};

// Determine which providers to use based on environment
const isDemoMode = import.meta.env.VITE_IS_DEMO === 'true';
const defaultDataProvider = isDemoMode ? fakerestDataProvider : supabaseDataProvider;
const defaultAuthProvider = isDemoMode ? fakerestAuthProvider : supabaseAuthProvider;

// Define the interface for the CRM component props
export type CRMProps = {
    dataProvider?: DataProvider;
    authProvider?: AuthProvider;
    darkTheme?: RaThemeOptions;
} & Partial<ConfigurationContextValue> &
    Partial<AdminProps>;

/**
 * CRM Component
 *
 * This component sets up and renders the main CRM application using `react-admin`. It provides
 * default configurations and themes but allows for customization through props. The component
 * wraps the application with a `ConfigurationProvider` to provide configuration values via context.
 *
 * @param {Array<ContactGender>} contactGender - The gender options for contacts used in the application.
 * @param {string[]} companySectors - The list of company sectors used in the application.
 * @param {RaThemeOptions} darkTheme - The theme to use when the application is in dark mode.
 * @param {string[]} dealCategories - The categories of deals used in the application.
 * @param {string[]} dealPipelineStatuses - The statuses of deals in the pipeline used in the application.
 * @param {DealStage[]} dealStages - The stages of deals used in the application.
 * @param {RaThemeOptions} lightTheme - The theme to use when the application is in light mode.
 * @param {string} logo - The logo used in the CRM application.
 * @param {NoteStatus[]} noteStatuses - The statuses of notes used in the application.
 * @param {string[]} taskTypes - The types of tasks used in the application.
 * @param {string} title - The title of the CRM application.
 *
 * @returns {JSX.Element} The rendered CRM application.
 *
 * @example
 * // Basic usage of the CRM component
 * import { CRM } from './CRM';
 *
 * const App = () => (
 *     <CRM
 *         logo="/path/to/logo.png"
 *         title="My Custom CRM"
 *         lightTheme={{
 *             ...defaultTheme,
 *             palette: {
 *                 primary: { main: '#0000ff' },
 *             },
 *         }}
 *     />
 * );
 *
 * export default App;
 */
export const CRM = ({
    contactGender = defaultContactGender,
    companySectors = defaultCompanySectors,
    darkTheme,
    logo = defaultLogo,
    noteStatuses = defaultNoteStatuses,
    taskTypes = defaultTaskTypes,
    title = defaultTitle,
    dataProvider = defaultDataProvider,
    authProvider = defaultAuthProvider,
    disableTelemetry,
    ...rest
}: CRMProps) => {
    useEffect(() => {
        if (
            disableTelemetry ||
            process.env.NODE_ENV !== 'production' ||
            typeof window === 'undefined' ||
            typeof window.location === 'undefined' ||
            typeof Image === 'undefined'
        ) {
            return;
        }
        const img = new Image();
        img.src = `https://atomic-crm-telemetry.marmelab.com/atomic-crm-telemetry?domain=${window.location.hostname}`;
    }, [disableTelemetry]);

    // Check if we should skip authentication for development
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';
    const finalAuthProvider = skipAuth ? devAuthProvider : authProvider;
    const requireAuth = !skipAuth;

    return (
        <ConfigurationProvider
            value={{
                contactGender,
                companySectors,
                dealCategories: [],
                dealPipelineStatuses: [],
                dealStages: [],
                logo,
                noteStatuses,
                taskTypes,
                title,
            }}
        >
            <Admin
                dataProvider={dataProvider}
                authProvider={finalAuthProvider}
                store={localStorageStore(undefined, 'CRM')}
                layout={Layout}
                loginPage={skipAuth ? undefined : UniversalLoginPage}
                dashboard={HomeDashboard}
                i18nProvider={i18nProvider}
                requireAuth={requireAuth}
                disableTelemetry
                {...rest}
            >
                <CustomRoutes noLayout>
                    <Route path={SignupPage.path} element={<SignupPage />} />
                    <Route
                        path={SetPasswordPage.path}
                        element={<SetPasswordPage />}
                    />
                    <Route
                        path={ForgotPasswordPage.path}
                        element={<ForgotPasswordPage />}
                    />
                </CustomRoutes>

                <CustomRoutes>
                    <Route
                        path={SettingsPage.path}
                        element={<SettingsPage />}
                    />
                    <Route
                        path="/reports"
                        element={<ReportsPage />}
                    />
                </CustomRoutes>
                <Resource name="contacts" {...contacts} />
                <Resource name="organizations" {...organizations} />
                <Resource name="interactions" {...interactions} />
                <Resource name="opportunities" {...opportunities} />
                <Resource name="products" {...products} />
                <Resource name="contactNotes" />
                <Resource name="tasks" list={ListGuesser} />
                <Resource name="sales" {...sales} />
                <Resource name="tags" list={ListGuesser} />
            </Admin>
        </ConfigurationProvider>
    );
};
