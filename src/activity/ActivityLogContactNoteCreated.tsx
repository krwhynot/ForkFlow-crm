import { Typography } from '@mui/material';
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
                        <Avatar width={20} height={20} />
                    </ReferenceField>
                    <Typography
                        component="p"
                        variant="body2"
                        color="text.secondary"
                        flexGrow={1}
                    >
                        <ReferenceField
                            source="salesId"
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
                                        reference="companies"
                                        link="show"
                                    />
                                </ReferenceField>{' '}
                                <RelativeDate date={activity.date} />
                            </>
                        )}
                    </Typography>
                    {context === 'company' && (
                        <Typography
                            color="textSecondary"
                            variant="body2"
                            component="span"
                        >
                            <RelativeDate date={activity.date} />
                        </Typography>
                    )}
                </>
            }
            text={contactNote.content}
        />
    );
}
