/* eslint-disable import/no-anonymous-default-export */
import { ContactShow } from './ContactShow';
import { ContactList } from './ContactList';
import { ContactEdit } from './ContactEdit';
import { ContactCreate } from './ContactCreate';
import { Contact } from '../types';

// Export individual components
export { ContactList, ContactShow, ContactEdit, ContactCreate };

// Default export for backwards compatibility
export default {
    list: ContactList,
    show: ContactShow,
    edit: ContactEdit,
    create: ContactCreate,
    recordRepresentation: (record: Contact) =>
        record?.firstName + ' ' + record?.lastName,
};
