// src/users/UserShow.tsx
import React from 'react';
import {
    EmailField,
    Show,
    SimpleShowLayout,
    TextField,
} from 'react-admin';
import { useBreakpoint } from '../hooks/useBreakpoint';

export const UserShow = () => {
    const isMobile = useBreakpoint('sm');
    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="name" />
                <EmailField source="email" />
                <TextField source="role" />
            </SimpleShowLayout>
        </Show>
    );
};
