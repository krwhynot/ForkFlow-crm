import { Link, ReferenceField } from 'react-admin';

import { Avatar } from '../contacts/Avatar';
import { RelativeDate } from '../misc/RelativeDate';
import { SaleName } from '../sales/SaleName';
import type { ActivityContactCreated } from '../types';
import { useActivityLogContext } from './ActivityLogContext';

type ActivityLogContactCreatedProps = {
    activity: ActivityContactCreated;
};

export function ActivityLogContactCreated({
    activity,
}: ActivityLogContactCreatedProps) {
    const context = useActivityLogContext();
    const { contact } = activity;

    if (!contact) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            <Avatar record={contact} />
            <p className="text-sm text-gray-500 flex-grow">
                <ReferenceField
                    source="userId"
                    reference="sales"
                    record={activity}
                    link={false}
                >
                    <SaleName />
                </ReferenceField>{' '}
                added{' '}
                <Link
                    to={`/contacts/${contact.id}/show`}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {contact.first_name} {contact.last_name}
                </Link>{' '}
                {context !== 'company' && (
                    <>
                        to{' '}
                        <ReferenceField
                            source="entityId"
                            reference="companies"
                            record={activity}
                            link="show"
                        />{' '}
                        <RelativeDate date={activity.createdAt} />
                    </>
                )}
            </p>
            {context === 'company' && (
                <p className="text-sm text-gray-500">
                    <RelativeDate date={activity.createdAt} />
                </p>
            )}
        </div>
    );
}
