import { Box, Card, CardContent, Typography } from '../components/ui-kit';
import { DocumentTextIcon as NoteIcon } from '@heroicons/react/24/outline';
import { formatDistance } from 'date-fns';
import {
    FunctionField,
    ReferenceField,
    TextField,
    useGetIdentity,
    useGetList,
} from 'react-admin';

import { Contact as ContactType } from '../types';

export const LatestNotes = () => {
    const { identity } = useGetIdentity();
    const { data: contactNotesData, isPending: contactNotesLoading } =
        useGetList(
            'contactNotes',
            {
                pagination: { page: 1, perPage: 5 },
                sort: { field: 'date', order: 'DESC' },
                filter: { salesId: identity?.id },
            },
            { enabled: Number.isInteger(identity?.id) }
        );
    const { data: dealNotesData, isPending: dealNotesLoading } = useGetList(
        'dealNotes',
        {
            pagination: { page: 1, perPage: 5 },
            sort: { field: 'date', order: 'DESC' },
            filter: { salesId: identity?.id },
        },
        { enabled: Number.isInteger(identity?.id) }
    );
    if (contactNotesLoading || dealNotesLoading) {
        return null;
    }
    // TypeScript guards
    if (!contactNotesData || !dealNotesData) {
        return null;
    }

    const allNotes = ([] as any[])
        .concat(
            contactNotesData.map(note => ({
                ...note,
                type: 'contactNote',
            })),
            dealNotesData.map(note => ({ ...note, type: 'dealNote' }))
        )
        .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())
        .slice(0, 5);

    return (
        <div>
            <Box className="flex items-center mb-4">
                <Box className="ml-4 mr-4 flex">
                    <NoteIcon className="h-8 w-8 text-gray-400" />
                </Box>
                <Typography variant="h5" className="text-gray-600">
                    My Latest Notes
                </Typography>
            </Box>
            <Card>
                <CardContent>
                    {allNotes.map(note => (
                        <Box
                            id={`${note.type}_${note.id}`}
                            key={`${note.type}_${note.id}`}
                            className="mb-4"
                        >
                            <Typography
                                variant="body2"
                                className="text-gray-600"
                                component="div"
                            >
                                on{' '}
                                {note.type === 'dealNote' ? (
                                    <Deal note={note} />
                                ) : (
                                    <Contact note={note} />
                                )}
                                , added{' '}
                                {formatDistance(note.date, new Date(), {
                                    addSuffix: true,
                                })}
                            </Typography>
                            <div>
                                <Typography
                                    variant="body2"
                                    className="line-clamp-3 overflow-hidden"
                                >
                                    {note.text}
                                </Typography>
                            </div>
                        </Box>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const Deal = ({ note }: any) => (
    <>
        Deal{' '}
        <ReferenceField
            record={note}
            source="deal_id"
            reference="deals"
            link="show"
        >
            <TextField source="name" variant="body2" />
        </ReferenceField>
    </>
);

const Contact = ({ note }: any) => (
    <>
        Contact{' '}
        <ReferenceField
            record={note}
            source="contact_id"
            reference="contacts"
            link="show"
        >
            <FunctionField<ContactType>
                variant="body2"
                render={contact => `${contact.first_name} ${contact.last_name}`}
            />
        </ReferenceField>
    </>
);
