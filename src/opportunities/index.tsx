/* eslint-disable import/no-anonymous-default-export */
import { OpportunityShow } from './OpportunityShow';
import { OpportunityList } from './OpportunityList';
import { OpportunityEdit } from './OpportunityEdit';
import { OpportunityCreate } from './OpportunityCreate';
import { Deal } from '../types';

// Export individual components
export { OpportunityList, OpportunityShow, OpportunityEdit, OpportunityCreate };

// Default export for react-admin resource registration
export default {
    list: OpportunityList,
    show: OpportunityShow,
    edit: OpportunityEdit,
    create: OpportunityCreate,
    recordRepresentation: (record: Deal) =>
        record?.name || `${record?.organization?.name} - ${record?.stage}`,
};