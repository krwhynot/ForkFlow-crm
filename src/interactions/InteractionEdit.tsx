import React from 'react';
import {
    Edit,
    SimpleForm,
    TopToolbar,
    ListButton,
    ShowButton,
    DeleteButton,
} from 'react-admin';
import { Box } from '@mui/material';

import { InteractionInputs } from './InteractionInputs';

const EditActions = () => (
    <TopToolbar>
        <ShowButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

export const InteractionEdit = () => {
    const transform = (data: any) => ({
        ...data,
        updatedAt: new Date().toISOString(),
    });

    return (
        <Edit
            actions={<EditActions />}
            transform={transform}
            sx={{
                '& .RaEdit-main': {
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
        </Edit>
    );
};