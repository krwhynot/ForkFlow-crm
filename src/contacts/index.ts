import { UserGroupIcon } from '@heroicons/react/24/outline';
import { ListGuesser } from 'react-admin';

// Import the new comprehensive ContactPage
import { ContactPage } from '../components/business/contacts';

export default {
    list: ContactPage, // Use the new comprehensive page
    icon: UserGroupIcon,
};
