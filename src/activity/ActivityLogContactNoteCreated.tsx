import { ReferenceField } from 'react-admin';

import { Avatar } from '../contacts/Avatar';
import { RelativeDate } from '../misc/RelativeDate';
import { SaleName } from '../sales/SaleName';
import type { ActivityContactNoteCreated } from '../types';
import { useActivityLogContext } from './ActivityLogContext';
import { ActivityLogNote } from './ActivityLogNote';

type ActivityLogContactNoteCreatedProps = {
    activity: ActivityContactNoteCreated;
};

export function ActivityLogContactNoteCreated({
    activity,
}: ActivityLogContactNoteCreatedProps) {
    const context = useActivityLogContext();
    const { contactNote } = activity;

    if (!contactNote) {
        return null;
    }

    return (
        <ActivityLogNote
            header={
                <>
                    <ReferenceField
                        source="contactId"
                        reference="contacts"
                        record={contactNote}
                        link={false}
                    >
                        <Avatar />
                    </ReferenceField>
                    <p className="text-sm text-gray-500 flex-grow">
                        <ReferenceField
                            source="userId"
                            reference="sales"
                            record={activity}
                            link={false}
                        >
                            <SaleName />
                        </ReferenceField>{' '}
                        added a note about{' '}
                        <ReferenceField
                            source="contactId"
                            reference="contacts"
                            record={contactNote}
                        />
                        {context !== 'company' && (
                            <>
                                {' from '}
                                <ReferenceField
                                    source="contactId"
                                    reference="contacts"
                                    record={contactNote}
                                    link={false}
                                >
                                    <ReferenceField
                                        source="organizationId"
                                        reference="organizations"
                                        link="show"
                                    />
                                </ReferenceField>{' '}
                                <RelativeDate date={activity.createdAt} />
                            </>
                        )}
                    </p>
                    {context === 'company' && (
                        <p className="text-sm text-gray-500">
                            <RelativeDate date={activity.createdAt} />
                        </p>
                    )}
                </>
            }
            text={contactNote.text}
        />
    );
}
