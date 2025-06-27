import * as React from 'react';
import { Create, Form, Toolbar, useGetIdentity } from 'react-admin';
import { CardContent, Typography, Box, Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Business as BusinessIcon } from '@mui/icons-material';

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
                            sx={{
                                mb: 3,
                                p: 2,
                                backgroundColor: 'primary.light',
                                borderRadius: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}
                            >
                                <BusinessIcon
                                    sx={{ mr: 1, color: 'primary.main' }}
                                />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'primary.main',
                                    }}
                                >
                                    Adding Contact to Organization
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
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
