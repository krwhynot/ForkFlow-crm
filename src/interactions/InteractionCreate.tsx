import React from 'react';
import {
    Create,
    SimpleForm,
    required,
    TopToolbar,
    ListButton,
    useGetIdentity,
} from 'react-admin';
import { Box } from '@mui/material';

import { InteractionInputs } from './InteractionInputs';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

export const InteractionCreate = () => {
    const { identity } = useGetIdentity();

    const transform = (data: any) => ({
        ...data,
        createdBy: identity?.id,
        isCompleted: false,
        scheduledDate: data.scheduledDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    return (
        <Create
            actions={<CreateActions />}
            transform={transform}
            sx={{
                '& .RaCreate-main': {
                    maxWidth: 800,
                    margin: '0 auto',
                },
            }}
        >
            <SimpleForm>
                <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <InteractionInputs />
                </Box>
            </SimpleForm>
        </Create>
    );
};