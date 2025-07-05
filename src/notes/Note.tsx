import { TrashIcon, PencilIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@/components/ui-kit';
import {
    IconButton,
    Tooltip,
} from '@/components/ui-kit';
import { useState } from 'react';
import {
    Form,
    ReferenceField,
    useDelete,
    useNotify,
    useResourceContext,
    useUpdate,
    WithRecord,
} from 'react-admin';
import { FieldValues, SubmitHandler } from 'react-hook-form';

import { CompanyAvatar } from '../companies/CompanyAvatar';
import { Avatar } from '../contacts/Avatar';
import { RelativeDate } from '../misc/RelativeDate';
import { Status } from '../misc/Status';
import { SaleName } from '../sales/SaleName';
import { ContactNote, DealNote } from '../types';
import { NoteAttachments } from './NoteAttachments';
import { NoteInputs } from './NoteInputs';

export const Note = ({
    showStatus,
    note,
}: {
    showStatus?: boolean;
    note: DealNote | ContactNote;
    isLast: boolean;
}) => {
    const [isHover, setHover] = useState(false);
    const [isEditing, setEditing] = useState(false);
    const resource = useResourceContext();
    const notify = useNotify();

    const [update, { isPending }] = useUpdate();

    const [deleteNote] = useDelete(
        resource,
        { id: note.id, previousData: note },
        {
            mutationMode: 'undoable',
            onSuccess: () => {
                notify('Note deleted', { type: 'info', undoable: true });
            },
        }
    );

    const handleDelete = () => {
        deleteNote();
    };

    const handleEnterEditMode = () => {
        setEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setHover(false);
    };

    const handleNoteUpdate: SubmitHandler<FieldValues> = values => {
        update(
            resource,
            { id: note.id, data: values, previousData: note },
            {
                onSuccess: () => {
                    setEditing(false);
                    setHover(false);
                },
            }
        );
    };

    return (
        <Box
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="pb-1"
        >
            <Stack className="flex-row space-x-1 items-center w-full">
                {resource === 'contactNote' ? (
                    <Avatar width={20} height={20} />
                ) : (
                    <ReferenceField
                        source="organizationId"
                        reference="companies"
                        link="show"
                    >
                        <CompanyAvatar width={20} height={20} />
                    </ReferenceField>
                )}
                <Typography className="text-gray-500" variant="body2">
                    <ReferenceField
                        record={note}
                        resource={resource}
                        source="organizationId"
                        reference="companies"
                        link={false}
                    >
                        <WithRecord
                            render={record => <SaleName sale={record} />}
                        />
                    </ReferenceField>{' '}
                    added a note{' '}
                    {showStatus && note.status && (
                        <Status status={note.status} />
                    )}
                    <Box
                        component="span"
                        className={`ml-2 ${isHover ? 'visible' : 'invisible'}`}
                    >
                        <Tooltip title="Edit note">
                            <IconButton
                                size="small"
                                onClick={handleEnterEditMode}
                            >
                                <PencilIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete note">
                            <IconButton size="small" onClick={handleDelete}>
                                <TrashIcon className="w-4 h-4" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Typography>
                <Box className="flex-1"></Box>
                <Typography
                    className="text-gray-500"
                    variant="body2"
                    component="span"
                >
                    <RelativeDate date={note.createdAt} />
                </Typography>
            </Stack>
            {isEditing ? (
                <Form onSubmit={handleNoteUpdate} record={note}>
                    <NoteInputs showStatus={showStatus} edition />
                    <Box className="flex justify-start mt-1">
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            disabled={isPending}
                            startIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                        >
                            Update Note
                        </Button>
                        <Button
                            className="ml-1"
                            onClick={handleCancelEdit}
                            color="primary"
                        >
                            Cancel
                        </Button>
                    </Box>
                </Form>
            ) : (
                <Stack
                    className="pt-2 flex [&_p:empty]:min-h-3"
                >
                    {note.content}

                    {note.attachments && <NoteAttachments note={note} />}
                </Stack>
            )}
        </Box>
    );
};
