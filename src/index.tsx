import companies from './companies';
import contacts from './contacts';
import deals from './deals';
import sales from './sales';

export { ForgotPasswordPage, SetPasswordPage } from 'ra-supabase';

export { RoleDashboard as Dashboard } from './dashboard/RoleDashboard';
export { Layout } from './layout/Layout';
export { UniversalLoginPage as LoginPage } from './login/UniversalLoginPage';
export { SignupPage } from './login/SignupPage';
export { CRM } from './root/CRM';
export type { CRMProps } from './root/CRM';
export { i18nProvider } from './root/i18nProvider';
export { SettingsPage } from './settings/SettingsPage';

export { companies, contacts, deals, sales };
