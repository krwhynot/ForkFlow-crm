import { SettingsList } from './SettingsList';
import { SettingsCreate } from './SettingsCreate';
import { SettingsEdit } from './SettingsEdit';
import { SettingsShow } from './SettingsShow';
import { PrincipalManager } from './PrincipalManager';

// Default export for resource registration
export default {
    list: SettingsList,
    create: SettingsCreate,
    edit: SettingsEdit,
    show: SettingsShow,
};

// Named exports for direct usage
export { SettingsList } from './SettingsList';
export { SettingsCreate } from './SettingsCreate';
export { SettingsEdit } from './SettingsEdit';
export { SettingsShow } from './SettingsShow';
export { SettingsPage } from './SettingsPage';
export { PrincipalManager } from './PrincipalManager';