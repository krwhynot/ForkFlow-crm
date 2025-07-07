/* eslint-disable import/no-anonymous-default-export */
import { ContactShow } from './ContactShow';
import { ContactList } from './ContactList';
import { ContactEdit } from './ContactEdit';
import { ContactCreate } from './ContactCreate';
import { Contact } from '../types';
import { ContactPage } from '../components/business/contacts';

// Export individual components
export { ContactList, ContactShow, ContactEdit, ContactCreate };

// Default export for backwards compatibility
export default {
    list: ContactPage, // Use the new comprehensive page
    show: ContactShow,
    edit: ContactEdit,
    create: ContactCreate,
    recordRepresentation: (record: Contact) =>
        record?.firstName + ' ' + record?.lastName,
};
