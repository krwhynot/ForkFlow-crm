import * as React from 'react';
import { Create, Form, Toolbar, useGetIdentity } from 'react-admin';
import { CardContent } from '@mui/material';

import { OrganizationInputs } from './OrganizationInputs';

export const OrganizationCreate = () => {
    const { identity } = useGetIdentity();
    return (
        <Create
            actions={false}
            redirect="show"
            transform={values => {
                // Add https:// before website if not present
                if (values.website && !values.website.startsWith('http')) {
                    values.website = `https://${values.website}`;
                }

                // Set the creator
                return {
                    ...values,
                    createdBy: identity?.id,
                };
            }}
        >
            <Form>
                <CardContent>
                    <OrganizationInputs />
                </CardContent>
                <Toolbar />
            </Form>
        </Create>
    );
};
