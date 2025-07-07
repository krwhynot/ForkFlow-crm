import { Stack, Typography } from '../components/ui-kit';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
    DateTimeInput,
    FileField,
    FileInput,
    SelectInput,
    TextInput,
} from 'react-admin';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useConfigurationContext } from '../root/ConfigurationContext';
import { formatNoteDate, getCurrentDate } from './utils';
import { Status } from '../misc/Status';

export const NoteInputs = ({
    showStatus,
    edition,
}: {
    showStatus?: boolean;
    edition?: boolean;
}) => {
    const { noteStatuses } = useConfigurationContext();
    const { setValue } = useFormContext();
    const [displayMore, setDisplayMore] = useState(false);
    return (
        <>
            <TextInput
                source="text"
                label={edition ? 'Edit note' : 'Add a note'}
                variant="filled"
                size="small"
                multiline
                minRows={3}
                helperText={false}
            />
            {!displayMore && (
                <Stack className="gap-1 flex-row justify-end">
                    <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        onClick={e => {
                            setDisplayMore(!displayMore);
                            setValue('date', getCurrentDate());
                            e.preventDefault();
                        }}
                    >
                        Show options
                        <ChevronDownIcon className="h-3 w-3" />
                    </button>
                    <Typography variant="caption" className="text-gray-500">
                        (attach files, or change details)
                    </Typography>
                </Stack>
            )}
            {displayMore && (
                <Stack className="gap-1 mt-1">
                    <Stack className="flex-row space-x-2">
                        {showStatus && (
                            <SelectInput
                                source="status"
                                choices={noteStatuses}
                                optionValue="value"
                                optionText={optionRenderer}
                                isRequired
                                defaultValue={'warm'}
                                helperText={false}
                            />
                        )}
                        <DateTimeInput
                            source="date"
                            label="Date"
                            helperText={false}
                            parse={formatNoteDate}
                        />
                    </Stack>
                    <FileInput
                        source="attachments"
                        multiple
                        accept={
                            {
                                'application/pdf': ['.pdf'],
                                'application/msword': ['.doc'],
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                    ['.docx'],
                                'text/plain': ['.txt'],
                                'text/csv': ['.csv'],
                            } as any
                        }
                    >
                        <FileField source="src" title="title" />
                    </FileInput>
                </Stack>
            )}
        </>
    );
};

const optionRenderer = (choice: any) => (
    <div>
        {choice.label} <Status status={choice.value} />
    </div>
);
