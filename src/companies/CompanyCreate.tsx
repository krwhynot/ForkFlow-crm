import { CardContent } from '@mui/material';
import { Create, Form, Toolbar, useGetIdentity } from 'react-admin';

import { CompanyInputs } from './CompanyInputs';

export const CompanyCreate = () => {
    const { identity } = useGetIdentity();
    return (
        <Create
            actions={false}
            redirect="show"
            transform={values => {
                // add https:// before website if not present
                if (values.website && !values.website.startsWith('http')) {
                    values.website = `https://${values.website}`;
                }
                return values;
            }}
        >
            <Form defaultValues={{ salesId: identity?.id }}>
                <CardContent>
                    <CompanyInputs />
                </CardContent>
                <Toolbar />
            </Form>
        </Create>
    );
};
