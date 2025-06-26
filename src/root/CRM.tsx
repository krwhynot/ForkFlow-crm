import { useEffect } from 'react';
import {
    Admin,
    CustomRoutes,
    ListGuesser,
    RaThemeOptions,
    Resource,
    defaultTheme,
    localStorageStore,
} from 'react-admin';
import type { AdminProps, AuthProvider, DataProvider } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { Route } from 'react-router';
import { ForgotPasswordPage, SetPasswordPage } from 'ra-supabase';

import { Layout } from '../layout/Layout';
import { i18nProvider } from './i18nProvider';
import { Dashboard } from '../dashboard/Dashboard';
import { LoginPage } from '../login/LoginPage';
import { SignupPage } from '../login/SignupPage';
import {
    authProvider as defaultAuthProvider,
    dataProvider as defaultDataProvider,
} from '../providers/supabase';
import { SettingsPage } from '../settings/SettingsPage';
import { LocationProvider } from '../components/mobile';
import {
    ConfigurationContextValue,
    ConfigurationProvider,
} from './ConfigurationContext';
import {
    defaultLogo,
    defaultTitle,
} from './defaultConfiguration';

// Food Broker CRM specific defaults
const defaultBusinessTypes = ['restaurant', 'grocery', 'distributor', 'other'];
const defaultVisitTypes = ['sales_call', 'follow_up', 'delivery', 'service_call', 'other'];
const defaultReminderPriorities = ['low', 'medium', 'high', 'urgent'];

// Define the interface for the Food Broker CRM component props
export type CRMProps = {
    dataProvider?: DataProvider;
    authProvider?: AuthProvider;
    lightTheme?: RaThemeOptions;
    darkTheme?: RaThemeOptions;
    businessTypes?: string[];
    visitTypes?: string[];
    reminderPriorities?: string[];
    enableGPS?: boolean;
} & Partial<Omit<ConfigurationContextValue, 'contactGender' | 'dealCategories' | 'dealStages'>> &
    Partial<AdminProps>;

const defaultLightTheme = deepmerge(defaultTheme, {
    palette: {
        background: {
            default: '#fafafb',
        },
        primary: {
            main: '#2F68AC',
        },
    },
    components: {
        RaFileInput: {
            styleOverrides: {
                root: {
                    '& .RaFileInput-dropZone': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                },
            },
        },
    },
});

/**
 * Food Broker CRM Component
 *
 * This component sets up and renders the food broker CRM application using `react-admin`. 
 * It's specifically designed for food brokers who visit restaurants and stores, with mobile-first
 * design, GPS integration, and food business management features.
 *
 * @param {RaThemeOptions} lightTheme - The theme to use when the application is in light mode.
 * @param {RaThemeOptions} darkTheme - The theme to use when the application is in dark mode.
 * @param {string} logo - The logo used in the CRM application.
 * @param {string} title - The title of the CRM application.
 * @param {string[]} businessTypes - The types of food businesses (restaurant, grocery, etc.)
 * @param {string[]} visitTypes - The types of visits brokers can log
 * @param {string[]} reminderPriorities - Priority levels for follow-up reminders
 * @param {boolean} enableGPS - Whether to enable GPS location features
 *
 * @returns {JSX.Element} The rendered Food Broker CRM application.
 *
 * @example
 * // Basic usage of the Food Broker CRM component
 * import { CRM } from './CRM';
 *
 * const App = () => (
 *     <CRM
 *         logo="/path/to/logo.png"
 *         title="ForkFlow Food Broker CRM"
 *         enableGPS={true}
 *     />
 * );
 *
 * export default App;
 */
export const CRM = ({
    darkTheme,
    lightTheme = defaultLightTheme,
    logo = defaultLogo,
    title = "ForkFlow Food Broker CRM",
    businessTypes = defaultBusinessTypes,
    visitTypes = defaultVisitTypes,
    reminderPriorities = defaultReminderPriorities,
    enableGPS = true,
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

    const AdminComponent = (
        <Admin
            dataProvider={dataProvider}
            authProvider={authProvider}
            store={localStorageStore(undefined, 'ForkFlowCRM')}
            layout={Layout}
            loginPage={LoginPage}
            dashboard={Dashboard}
            theme={lightTheme}
            darkTheme={darkTheme || null}
            i18nProvider={i18nProvider}
            requireAuth
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
            </CustomRoutes>
            
            {/* Food Broker CRM Resources */}
            <Resource name="customers" list={ListGuesser} />
            <Resource name="visits" list={ListGuesser} />
            <Resource name="reminders" list={ListGuesser} />
            <Resource name="products" list={ListGuesser} />
            <Resource name="orders" list={ListGuesser} />
            <Resource name="territories" list={ListGuesser} />
        </Admin>
    );

    return (
        <ConfigurationProvider
            logo={logo}
            title={title}
            // Food broker specific configuration can be added here
        >
            {enableGPS ? (
                <LocationProvider autoRequest={false}>
                    {AdminComponent}
                </LocationProvider>
            ) : (
                AdminComponent
            )}
        </ConfigurationProvider>
    );
};
