import { OrganizationList } from './OrganizationList';
import { OrganizationCreate } from './OrganizationCreate';
import { OrganizationEdit } from './OrganizationEdit';
import { OrganizationShow } from './OrganizationShow';

// Default export for resource registration
export default {
    list: OrganizationList,
    create: OrganizationCreate,
    edit: OrganizationEdit,
    show: OrganizationShow,
};

// Named exports for direct usage
export { OrganizationList } from './OrganizationList';
export { OrganizationCreate } from './OrganizationCreate';
export { OrganizationEdit } from './OrganizationEdit';
export { OrganizationShow } from './OrganizationShow';
export { OrganizationInputs } from './OrganizationInputs';
export { OrganizationCard } from './OrganizationCard';
export { OrganizationEmpty } from './OrganizationEmpty';
export { OrganizationListFilter } from './OrganizationListFilter';
