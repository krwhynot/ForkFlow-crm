// Import from organized subdirectories
import { OrganizationList } from './list';
import { OrganizationCreate, OrganizationEdit } from './form';
import { OrganizationShow } from './show';

// Default export for resource registration
export default {
    list: OrganizationList,
    create: OrganizationCreate,
    edit: OrganizationEdit,
    show: OrganizationShow,
};

// Re-export all components from organized subdirectories
export * from './list';
export * from './form';
export * from './show';
export * from './common';
export * from './hooks';
export * from './utils';
