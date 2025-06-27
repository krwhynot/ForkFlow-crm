import {
    Divider,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    ReferenceInput,
    SelectInput,
    TextInput,
    required,
    useRecordContext,
    useGetList,
} from 'react-admin';
import { Organization, Setting } from '../types';

const isUrl = (url: string) => {
    if (!url) return;
    const UrlRegex = new RegExp(
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
    );
    if (!UrlRegex.test(url)) {
        return 'Must be a valid URL';
    }
};

const isEmail = (email: string) => {
    if (!email) return;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
        return 'Must be a valid email address';
    }
};

const isPhoneNumber = (phone: string) => {
    if (!phone) return;
    const phoneRegex = /^[\d\s\-\.\(\)\+]+$/;
    if (!phoneRegex.test(phone)) {
        return 'Must be a valid phone number';
    }
};

const isZipCode = (zipCode: string) => {
    if (!zipCode) return;
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(zipCode)) {
        return 'Must be a valid ZIP code (12345 or 12345-6789)';
    }
};

export const OrganizationInputs = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Stack gap={4} p={1}>
            <OrganizationDisplayInputs />
            <Stack gap={4} direction={isMobile ? 'column' : 'row'}>
                <Stack gap={4} flex={1}>
                    <OrganizationContactInputs />
                    <OrganizationContextInputs />
                </Stack>
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <Stack gap={4} flex={1}>
                    <OrganizationAddressInputs />
                    <OrganizationNotesInputs />
                    <OrganizationAccountManagerInput />
                </Stack>
            </Stack>
        </Stack>
    );
};

const OrganizationDisplayInputs = () => {
    const record = useRecordContext<Organization>();
    return (
        <Stack gap={2} flex={1}>
            <TextInput
                source="name"
                label="Organization Name"
                validate={required()}
                helperText={false}
                sx={{
                    mt: 0,
                }}
                fullWidth
            />
        </Stack>
    );
};

const OrganizationContactInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Contact Information</Typography>
            <TextInput
                source="website"
                label="Website"
                helperText={false}
                validate={isUrl}
            />
            <TextInput
                source="phone"
                label="Phone Number"
                helperText={false}
                validate={isPhoneNumber}
            />
        </Stack>
    );
};

const OrganizationContextInputs = () => {
    const { data: prioritySettings } = useGetList<Setting>('settings', {
        filter: { category: 'priority', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: segmentSettings } = useGetList<Setting>('settings', {
        filter: { category: 'segment', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    const { data: distributorSettings } = useGetList<Setting>('settings', {
        filter: { category: 'distributor', active: true },
        sort: { field: 'sortOrder', order: 'ASC' },
        pagination: { page: 1, perPage: 100 },
    });

    return (
        <Stack>
            <Typography variant="h6">Business Context</Typography>
            <SelectInput
                source="priorityId"
                label="Priority"
                choices={
                    prioritySettings?.map(setting => ({
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
            />
            <SelectInput
                source="segmentId"
                label="Business Segment"
                choices={
                    segmentSettings?.map(setting => ({
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
            />
            <SelectInput
                source="distributorId"
                label="Primary Distributor"
                choices={
                    distributorSettings?.map(setting => ({
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
            />
        </Stack>
    );
};

const OrganizationAddressInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Address</Typography>
            <TextInput
                source="address"
                label="Street Address"
                helperText={false}
            />
            <TextInput source="city" label="City" helperText={false} />
            <TextInput source="state" label="State" helperText={false} />
            <TextInput
                source="zipCode"
                label="ZIP Code"
                helperText={false}
                validate={isZipCode}
            />
        </Stack>
    );
};

const OrganizationNotesInputs = () => {
    return (
        <Stack>
            <Typography variant="h6">Notes</Typography>
            <TextInput
                source="notes"
                label="Business Notes"
                multiline
                helperText={false}
                minRows={3}
            />
        </Stack>
    );
};

const OrganizationAccountManagerInput = () => {
    return (
        <Stack>
            <Typography variant="h6">Account Manager</Typography>
            <TextInput
                source="accountManager"
                label="Account Manager Email"
                helperText={false}
                validate={isEmail}
            />
        </Stack>
    );
};
