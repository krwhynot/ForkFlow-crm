import { MenuItem, TextField } from '@mui/material';
import * as React from 'react';

import { Status } from '../misc/Status';
import { useConfigurationContext } from '../root/ConfigurationContext';

export const StatusSelector = ({ status, setStatus, className }: any) => {
    const { noteStatuses } = useConfigurationContext();
    const noteStatusesTyped: (string | { value: string; label: string })[] =
        noteStatuses ?? [];

    return (
        <TextField
            select
            value={status}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                setStatus(event.target.value);
            }}
            variant="filled"
            label={false}
            margin="none"
            size="small"
            className={className}
        >
            {noteStatusesTyped.map(status => {
                if (
                    typeof status === 'object' &&
                    status &&
                    'value' in status &&
                    'label' in status
                ) {
                    return (
                        <MenuItem key={status.value} value={status.value}>
                            {status.label} <Status status={status.value} />
                        </MenuItem>
                    );
                }
                return (
                    <MenuItem key={String(status)} value={String(status)}>
                        {String(status)} <Status status={String(status)} />
                    </MenuItem>
                );
            })}
        </TextField>
    );
};
