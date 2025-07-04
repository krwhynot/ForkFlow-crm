import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { CRM } from './root/CRM';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
    <React.StrictMode>
        <CRM />
    </React.StrictMode>
);

// Library exports (kept for compatibility)
export { RoleDashboard as Dashboard } from './dashboard/RoleDashboard';
export { Layout } from './layout/Layout';
export { UniversalLoginPage as LoginPage } from './login/UniversalLoginPage';
export { SignupPage } from './login/SignupPage';
export { CRM } from './root/CRM';
export type { CRMProps } from './root/CRM';
export { i18nProvider } from './root/i18nProvider';
export { SettingsPage } from './settings/SettingsPage';

import companies from './companies';
import contacts from './contacts';
import deals from './deals';
import sales from './sales';

export { companies, contacts, deals, sales };
