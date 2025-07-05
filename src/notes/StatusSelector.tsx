import { Select, SelectItem } from '@/components/ui-kit';
import * as React from 'react';

import { Status } from '../misc/Status';
import { useConfigurationContext } from '../root/ConfigurationContext';

export const StatusSelector = ({ status, setStatus, className }: any) => {
    const { noteStatuses } = useConfigurationContext();
    const noteStatusesTyped: (string | { value: string; label: string })[] =
        noteStatuses ?? [];

    return (
        <Select
            value={status}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                setStatus(event.target.value);
            }}
            variant="filled"
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
                        <SelectItem key={status.value} value={status.value}>
                            {status.label} <Status status={status.value} />
                        </SelectItem>
                    );
                }
                return (
                    <SelectItem key={String(status)} value={String(status)}>
                        {String(status)} <Status status={String(status)} />
                    </SelectItem>
                );
            })}
        </Select>
    );
};
