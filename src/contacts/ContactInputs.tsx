import {
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import * as React from 'react';
import {
    AutocompleteInput,
    BooleanInput,
    ReferenceInput,
    SelectInput,
    TextInput,
    useCreate,
    useGetIdentity,
    useGetList,
    useNotify,
    useRecordContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { isLinkedinUrl } from '../misc/isLinkedInUrl';
import { Contact, Setting } from '../types';

const isEmail = (email: string) => {
    if (!email) return;
    
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Basic format check
    if (!emailRegex.test(email)) {
        return 'Must be a valid email address';
    }
    
    // Length validation
    if (email.length > 254) {
        return 'Email address is too long';
    }
    
    // Local part validation (before @)
    const localPart = email.split('@')[0];
    if (localPart.length > 64) {
        return 'Email local part is too long';
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
        return 'Email cannot contain consecutive dots';
    }
};

const isPhoneNumber = (phone: string) => {
    if (!phone) return;
    
    // Remove all spaces, dashes, dots, parentheses for validation
    const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
    
    // Must contain only digits and optional + at start
    const phoneRegex = /^\+?[\d]{7,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
        return 'Must be a valid phone number (7-15 digits)';
    }
    
    // US phone number format validation (optional)
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('+')) {
        // US format: area code cannot start with 0 or 1
        const areaCode = cleanPhone.substring(0, 3);
        if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
            return 'Invalid US area code';
        }
    }
};

interface ContactInputsProps {
    defaultOrganizationId?: number;
}

export const ContactInputs: React.FC<ContactInputsProps> = ({
    defaultOrganizationId,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stack gap={4} p={1}>
            <ContactDisplayInputs
                defaultOrganizationId={defaultOrganizationId}
            />
            <Stack gap={4} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={1}>
                    <ContactIdentityInputs />
                    <ContactOrganizationInputs
                        defaultOrganizationId={defaultOrganizationId}
                    />
                </Stack>
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <Stack gap={4} flex={1}>
                    <ContactInfoInputs />
                    <ContactRoleInputs />
                    <ContactNotesInputs />
                </Stack>
            </Stack>
        </Stack>
    );
};

interface ContactDisplayInputsProps {
    defaultOrganizationId?: number;
}

const ContactDisplayInputs: React.FC<ContactDisplayInputsProps> = ({
    defaultOrganizationId,
}) => {
    const record = useRecordContext<Contact>();
    return (
        <Stack gap={2} flex={1}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Contact Information
            </Typography>
        </Stack>
    );
};

const ContactIdentityInputs = () => {
    const { setValue, watch } = useFormContext();
    const firstName = watch('firstName');
    const lastName = watch('lastName');

    return (
        <Stack>
            <Typography variant="h6">Personal Details</Typography>
            <TextInput
                source="firstName"
                label="First Name"
                helperText={false}
                fullWidth
            />
            <TextInput
                source="lastName"
                label="Last Name"
                helperText={false}
                fullWidth
            />
        </Stack>
    );
};

interface ContactOrganizationInputsProps {
    defaultOrganizationId?: number;
}

const ContactOrganizationInputs: React.FC<ContactOrganizationInputsProps> = ({
    defaultOrganizationId,
}) => {
    const [create] = useCreate();
    const { identity } = useGetIdentity();
    const notify = useNotify();
    const { setValue } = useFormContext();

    // Set default organization if provided
    React.useEffect(() => {
        if (defaultOrganizationId) {
            setValue('organizationId', defaultOrganizationId);
        }
    }, [defaultOrganizationId, setValue]);

    const handleCreateOrganization = async (name?: string) => {
        if (!name) return;
        try {
            const newOrganization = await create(
                'organizations',
                {
                    data: {
                        name,
                        createdBy: identity?.id,
                        createdAt: new Date().toISOString(),
                    },
                },
                { returnPromise: true }
            );
            return newOrganization;
        } catch (error) {
            notify('An error occurred while creating the organization', {
                type: 'error',
            });
        }
    };

    return (
        <Stack>
            <Typography variant="h6">Organization</Typography>
            <ReferenceInput source="organizationId" reference="organizations">
                <AutocompleteInput
                    optionText="name"
                    onCreate={handleCreateOrganization}
                    helperText={false}
                    fullWidth
                    label="Organization"
                    disabled={!!defaultOrganizationId}
                />
            </ReferenceInput>

            <BooleanInput
                source="isPrimary"
                label="Primary Contact"
                helperText="Mark as the primary contact for this organization"
                defaultValue={false}
            />
        </Stack>
    );
};

const ContactInfoInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Contact Information</Typography>
            <TextInput
                source="email"
                label="Email Address"
                validate={isEmail}
                helperText={false}
                fullWidth
            />
            <TextInput
                source="phone"
                label="Phone Number"
                validate={isPhoneNumber}
                helperText={false}
                fullWidth
            />
            <TextInput
                source="linkedInUrl"
                label="LinkedIn URL"
                validate={isLinkedinUrl}
                helperText={false}
                fullWidth
            />
        </Stack>
    );
};

const ContactRoleInputs = () => {
    const { data: roleSettings } = useGetList<Setting>('settings', {
        filter: { category: 'role', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: influenceSettings } = useGetList<Setting>('settings', {
        filter: { category: 'influence', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: decisionSettings } = useGetList<Setting>('settings', {
        filter: { category: 'decision', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return (
        <Stack>
            <Typography variant="h6">Business Role</Typography>

            <SelectInput
                source="roleId"
                label="Position/Role"
                choices={
                    roleSettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
                fullWidth
            />

            <SelectInput
                source="influenceLevelId"
                label="Influence Level"
                choices={
                    influenceSettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
                fullWidth
            />

            <SelectInput
                source="decisionRoleId"
                label="Decision Role"
                choices={
                    decisionSettings?.map(setting => ({
                        id: setting.id,
                        name: setting.label,
                        color: setting.color,
                    })) || []
                }
                helperText={false}
                optionText={(choice: any) => (
                    <span style={{ color: choice.color || 'inherit' }}>
                        {choice.name}
                    </span>
                )}
                fullWidth
            />
        </Stack>
    );
};

const ContactNotesInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Notes</Typography>
            <TextInput
                source="notes"
                label="Contact Notes"
                multiline
                helperText={false}
                minRows={3}
                fullWidth
            />
        </Stack>
    );
};
