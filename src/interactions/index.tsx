import { InteractionCreate } from './InteractionCreate';
import { InteractionEdit } from './InteractionEdit';
import { InteractionList } from './InteractionList';
import { InteractionShow } from './InteractionShow';

// Import the new placeholder InteractionPage
import { InteractionPage } from '../components/business/interactions';

export * from './InteractionCard';
export * from './InteractionCreate';
export * from './InteractionEdit';
export * from './InteractionEmpty';
export * from './InteractionFilters';
export * from './InteractionInputs';
export * from './InteractionList';
export * from './InteractionShow';
export * from './InteractionTimeline';
export * from './InteractionTypeSelector';

const interactions = {
    list: InteractionPage, // Use the new placeholder page
    create: InteractionCreate,
    edit: InteractionEdit,
    show: InteractionShow,
};

export default interactions;
