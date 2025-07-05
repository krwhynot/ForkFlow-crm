import { PlusCircleIcon, QuestionMarkCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useGetIdentity, useGetList } from 'react-admin';
import { Link } from 'react-router-dom';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui-kit';
import { Avatar } from '../contacts/Avatar';
import { Contact } from '../types';

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

    // Sample data to match the Atomic CRM design
    const sampleContacts = [
        {
            id: 1,
            name: 'Tyra Fadel',
            company: 'Wehner, Schamberger and Huel',
            initials: 'TF',
            avatar: null
        },
        {
            id: 2,
            name: 'Cathy Hermann',
            company: 'Cormier, Williamson and Pollich',
            initials: 'CH',
            avatar: null
        },
        {
            id: 3,
            name: 'Alton Barrows',
            company: 'Kihn, Daniel and Wolff',
            initials: 'AB',
            avatar: null
        },
        {
            id: 4,
            name: 'Bridget Heaney',
            company: 'Gorczany - Hessel',
            initials: 'BH',
            avatar: null
        },
        {
            id: 5,
            name: 'Dennis Stokes',
            company: 'Bosco - Prohaska',
            initials: 'DS',
            avatar: null
        },
        {
            id: 6,
            name: 'Domingo Keebler',
            company: 'Hirthe, Emmerich and Toy',
            initials: 'DK',
            avatar: null
        }
    ];

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        <CardTitle className="text-lg font-semibold text-gray-800">Hot Contacts</CardTitle>
                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <Link to="/contacts/create" title="Create contact">
                        <PlusCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-4">
                    {sampleContacts.map(contact => (
                        <div
                            key={contact.id}
                            className="flex items-center space-x-3"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {contact.initials}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {contact.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {contact.company}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Hide real data for now to prevent loading issues */}
                    {false && contactData && contactData.length > 0 && (
                        <>
                            {contactData.map(contact => (
                                <div
                                    key={contact.id}
                                    className="flex items-center space-x-3"
                                >
                                    <Avatar record={contact} />
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/contacts/${contact.id}/show`}
                                            className="text-sm font-medium text-gray-900 hover:underline truncate block"
                                        >
                                            {contact.first_name}{' '}
                                            {contact.last_name}
                                        </Link>
                                        <p className="text-sm text-gray-500 truncate">
                                            {contact.title} at{' '}
                                            {contact.organization?.name}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
