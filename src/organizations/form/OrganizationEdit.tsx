import * as React from 'react';
import { Edit, Form, Toolbar } from 'react-admin';
import { CardContent } from '@/components/ui-kit/Card';

import { OrganizationInputs } from './OrganizationInputs';

export const OrganizationEdit = () => {
    return (
        <Edit
            actions={false}
            redirect="show"
            transform={values => {
                // Add https:// before website if not present
                if (values.website && !values.website.startsWith('http')) {
                    values.website = `https://${values.website}`;
                }

                return values;
            }}
        >
            <Form>
                <CardContent>
                    <OrganizationInputs />
                </CardContent>
                <Toolbar />
            </Form>
        </Edit>
    );
};
