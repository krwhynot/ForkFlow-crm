import { UserGroupIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useGetIdentity, useGetList } from 'react-admin';
import { Link } from 'react-router-dom';

import { Avatar } from '../contacts/Avatar';
import { Contact } from '../types';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui-kit/Card';
import { Spinner } from '../components/ui-kit/Spinner';

export const HotContacts = () => {
    const { identity } = useGetIdentity();
    const {
        data: contactData,
        total: contactTotal,
        isPending: contactsLoading,
    } = useGetList<Contact>(
        'contacts',
        {
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'last_seen', order: 'DESC' },
            filter: { status: 'hot', salesId: identity?.id },
        },
        { enabled: Number.isInteger(identity?.id) }
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UserGroupIcon className="h-6 w-6 text-gray-400" />
                        <CardTitle>Hot Contacts</CardTitle>
                    </div>
                    <Link to="/contacts/create" title="Create contact">
                        <PlusCircleIcon className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent>
                {contactsLoading ? (
                    <div className="flex justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {contactData && contactData.length > 0 ? (
                            contactData.map(contact => (
                                <li
                                    key={contact.id}
                                    className="py-4 flex items-center space-x-4"
                                >
                                    <Avatar record={contact} />
                                    <div className="flex-1">
                                        <Link
                                            to={`/contacts/${contact.id}/show`}
                                            className="font-medium text-gray-900 hover:underline"
                                        >
                                            {contact.first_name}{' '}
                                            {contact.last_name}
                                        </Link>
                                        <p className="text-sm text-gray-500">
                                            {contact.title} at{' '}
                                            {contact.organization?.name}
                                        </p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm text-gray-500">
                                    Contacts with a "hot" status will appear
                                    here.
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Change the status of a contact by adding a
                                    note to that contact and clicking on "show
                                    options".
                                </p>
                            </div>
                        )}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
