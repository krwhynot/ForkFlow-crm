import * as React from 'react';
import { Create, Form, Toolbar, useGetIdentity } from 'react-admin';
import { CardContent, Typography, Box } from '../components/ui-kit';
import { useLocation } from 'react-router-dom';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

import { ContactInputs } from './ContactInputs';

export const ContactCreate = () => {
    const { identity } = useGetIdentity();
    const location = useLocation();

    // Extract organizationId from URL search params
    const searchParams = new URLSearchParams(location.search);
    const organizationId = searchParams.get('organizationId');

    return (
        <Create
            actions={false}
            redirect="show"
            transform={values => {
                // Ensure proper data structure for our B2B schema
                return {
                    ...values,
                    organizationId: organizationId
                        ? parseInt(organizationId, 10)
                        : values.organizationId,
                    createdBy: identity?.id,
                    createdAt: new Date().toISOString(),
                };
            }}
        >
            <Form>
                <CardContent>
                    {organizationId && (
                        <Box
                            className="mb-6 p-4 bg-blue-50 rounded-lg"
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                className="mb-2"
                            >
                                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                                <Typography
                                    variant="h6"
                                    className="font-semibold text-blue-600"
                                >
                                    Adding Contact to Organization
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                This contact will be automatically linked to the
                                selected organization.
                            </Typography>
                        </Box>
                    )}
                    <ContactInputs
                        defaultOrganizationId={
                            organizationId
                                ? parseInt(organizationId, 10)
                                : undefined
                        }
                    />
                </CardContent>
                <Toolbar />
            </Form>
        </Create>
    );
};
