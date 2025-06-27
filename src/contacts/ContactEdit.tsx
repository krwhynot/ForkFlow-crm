import * as React from 'react';
import { Edit, Form, Toolbar } from 'react-admin';
import { CardContent } from '@mui/material';

import { ContactInputs } from './ContactInputs';

export const ContactEdit = () => {
    return (
        <Edit actions={false} redirect="show">
            <Form>
                <CardContent>
                    <ContactInputs />
                </CardContent>
                <Toolbar />
            </Form>
        </Edit>
    );
};
