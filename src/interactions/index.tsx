import { InteractionCreate } from './InteractionCreate';
import { InteractionEdit } from './InteractionEdit';
import { InteractionList } from './InteractionList';
import { InteractionShow } from './InteractionShow';

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
    list: InteractionList,
    create: InteractionCreate,
    edit: InteractionEdit,
    show: InteractionShow,
};

export default interactions;
