import { deepmerge } from '@mui/utils';
import { ForgotPasswordPage, SetPasswordPage } from 'ra-supabase';
import { useEffect } from 'react';
import type { AdminProps, AuthProvider, DataProvider } from 'react-admin';
import {
    Admin,
    CustomRoutes,
    ListGuesser,
    RaThemeOptions,
    Resource,
    defaultTheme,
    localStorageStore,
} from 'react-admin';
import { Route } from 'react-router';

import companies from '../companies';
import { LocationProvider } from '../components/mobile';
import {
    ContactCreate,
    ContactEdit,
    ContactList,
    ContactShow,
} from '../contacts';
import { CustomerList } from '../customers';
import { FoodBrokerDashboard } from '../dashboard/FoodBrokerDashboard';
import { Layout } from '../layout/Layout';
import { LoginPage } from '../login/LoginPage';
import { SignupPage } from '../login/SignupPage';
import {
    OrganizationCreate,
    OrganizationEdit,
    OrganizationList,
    OrganizationShow,
} from '../organizations';
import {
    authProvider as defaultAuthProvider,
    dataProvider as defaultDataProvider,
} from '../providers/supabase';
import { ReminderCreate, ReminderList, ReminderShow } from '../reminders';
import { SettingsPage } from '../settings/SettingsPage';
import { VisitCreate, VisitList, VisitShow } from '../visits';
import {
    ConfigurationContextValue,
    ConfigurationProvider,
} from './ConfigurationContext';
import { defaultLogo } from './defaultConfiguration';
import { i18nProvider } from './i18nProvider';

// Food Broker CRM specific defaults
const defaultBusinessTypes = ['restaurant', 'grocery', 'distributor', 'other'];
const defaultVisitTypes = [
    'sales_call',
    'follow_up',
    'delivery',
    'service_call',
    'other',
];
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
    requireAuth?: boolean;
} & Partial<
    Omit<
        ConfigurationContextValue,
        'contactGender' | 'dealCategories' | 'dealStages'
    >
> &
    Partial<AdminProps>;

const defaultLightTheme = deepmerge(defaultTheme, {
    palette: {
        background: {
            default: '#fafafb',
        },
        primary: {
            main: '#9bbb59',
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
    title = 'ForkFlow Food Broker CRM',
    businessTypes = defaultBusinessTypes,
    visitTypes = defaultVisitTypes,
    reminderPriorities = defaultReminderPriorities,
    enableGPS = true,
    dataProvider = defaultDataProvider,
    authProvider = defaultAuthProvider,
    requireAuth = true,
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
            dashboard={FoodBrokerDashboard}
            theme={lightTheme}
            darkTheme={darkTheme || null}
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
                <Route path={SettingsPage.path} element={<SettingsPage />} />
            </CustomRoutes>

            {/* Food Broker CRM Resources */}
            <Resource
                name="companies"
                list={companies.list}
                create={companies.create}
                edit={companies.edit}
                show={companies.show}
                options={{ label: 'Organizations' }}
            />
            <Resource
                name="organizations"
                list={OrganizationList}
                create={OrganizationCreate}
                edit={OrganizationEdit}
                show={OrganizationShow}
            />
            <Resource
                name="contacts"
                list={ContactList}
                create={ContactCreate}
                edit={ContactEdit}
                show={ContactShow}
            />
            <Resource name="customers" list={CustomerList} />
            <Resource
                name="visits"
                list={VisitList}
                create={VisitCreate}
                show={VisitShow}
            />
            <Resource
                name="reminders"
                list={ReminderList}
                create={ReminderCreate}
                show={ReminderShow}
            />
            <Resource name="products" list={ListGuesser} />
            <Resource name="orders" list={ListGuesser} />
            <Resource name="territories" list={ListGuesser} />
        </Admin>
    );

    return (
        <ConfigurationProvider
            logo={logo}
            title={title}
            // Food broker specific configuration
            companySectors={[
                'food_service',
                'retail',
                'distribution',
                'manufacturing',
            ]}
            dealCategories={[
                'new_business',
                'existing_account',
                'upsell',
                'renewal',
            ]}
            dealPipelineStatuses={[
                'lead',
                'qualified',
                'proposal',
                'negotiation',
                'closed_won',
                'closed_lost',
            ]}
            dealStages={[
                { value: 'lead_discovery', label: 'Lead Discovery' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'sampled_visited', label: 'Sampled/Visited' },
                { value: 'follow_up', label: 'Follow Up' },
                { value: 'close', label: 'Close' },
            ]}
            noteStatuses={['draft', 'published']}
            taskTypes={['call', 'email', 'meeting', 'follow_up', 'demo']}
            contactGender={['male', 'female', 'other']}
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
