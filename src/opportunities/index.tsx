/* eslint-disable import/no-anonymous-default-export */
import { OpportunityShow } from './OpportunityShow';
import { OpportunityList } from './OpportunityList';
import { OpportunityEdit } from './OpportunityEdit';
import { OpportunityCreate } from './OpportunityCreate';

// Import the new placeholder OpportunityPage
import { OpportunityPage } from '../components/opportunities';

// Export individual components
export { OpportunityList, OpportunityShow, OpportunityEdit, OpportunityCreate };

// Default export for react-admin resource registration
export default {
    list: OpportunityPage, // Use the new placeholder page
    show: OpportunityShow,
    edit: OpportunityEdit,
    create: OpportunityCreate,
};
