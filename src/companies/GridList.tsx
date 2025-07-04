import * as React from 'react';
import { Box, Paper } from '../components/ui-kit';
import { RecordContextProvider, useListContext } from 'react-admin';

import { CompanyCard } from './CompanyCard';
import { Company } from '../types';

const times = (nbChildren: number, fn: (key: number) => any) =>
    Array.from({ length: nbChildren }, (_, key) => fn(key));

const LoadingGridList = () => (
    <Box className="flex flex-wrap gap-1" style={{ width: 1008 }}>
        {times(15, key => (
            <Paper className="h-50 w-48 flex flex-col bg-gray-200" key={key} />
        ))}
    </Box>
);

const LoadedGridList = () => {
    const { data, error, isPending } = useListContext<Company>();

    if (isPending || error) return null;

    return (
        <Box
            className="w-full gap-1 grid"
            style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            }}
        >
            {data.map(record => (
                <RecordContextProvider key={record.id} value={record}>
                    <CompanyCard />
                </RecordContextProvider>
            ))}

            {data.length === 0 && <p className="p-2">No companies found</p>}
        </Box>
    );
};

export const ImageList = () => {
    const { isPending } = useListContext();
    return isPending ? <LoadingGridList /> : <LoadedGridList />;
};
