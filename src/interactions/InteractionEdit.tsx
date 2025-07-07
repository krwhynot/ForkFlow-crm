import React from 'react';
import {
    Edit,
    SimpleForm,
    TopToolbar,
    ListButton,
    ShowButton,
    DeleteButton,
} from 'react-admin';
import { Box } from '../components/ui-kit';

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
            className="[&_.RaEdit-main]:max-w-4xl [&_.RaEdit-main]:mx-auto"
        >
            <SimpleForm>
                <Box className="w-full max-w-xl">
                    <InteractionInputs />
                </Box>
            </SimpleForm>
        </Edit>
    );
};
