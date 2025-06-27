import { Card, Stack } from '@mui/material';
import jsonExport from 'jsonexport/dist';
import type { Exporter } from 'react-admin';
import {
    BulkActionsToolbar,
    BulkDeleteButton,
    BulkExportButton,
    CreateButton,
    downloadCSV,
    ExportButton,
    ListBase,
    ListToolbar,
    Pagination,
    SortButton,
    Title,
    TopToolbar,
    useGetIdentity,
    useListContext,
    Button,
    useUpdateMany,
    useNotify,
    useRefresh,
    useUnselectAll,
} from 'react-admin';
import { Star as StarIcon } from '@mui/icons-material';

import { Organization, Contact, Setting } from '../types';
import { ContactEmpty } from './ContactEmpty';
import { ContactImportButton } from './ContactImportButton';
import { ContactListContent } from './ContactListContent';
import { ContactListFilter } from './ContactListFilter';

export const ContactList = () => {
    const { identity } = useGetIdentity();

    if (!identity) return null;

    return (
        <ListBase
            perPage={25}
            sort={{ field: 'firstName', order: 'ASC' }}
            exporter={exporter}
        >
            <ContactListLayout />
        </ListBase>
    );
};

const ContactListLayout = () => {
    const { data, isPending, filterValues } = useListContext();
    const { identity } = useGetIdentity();

    const hasFilters = filterValues && Object.keys(filterValues).length > 0;

    if (!identity || isPending) return null;

    if (!data?.length && !hasFilters) return <ContactEmpty />;

    return (
        <Stack direction="row">
            <ContactListFilter />
            <Stack sx={{ width: '100%' }}>
                <Title title={'Contacts'} />
                <ListToolbar actions={<ContactListActions />} />
                <BulkActionsToolbar>
                    <BulkSetPrimaryButton />
                    <BulkExportButton />
                    <BulkDeleteButton />
                </BulkActionsToolbar>
                <Card>
                    <ContactListContent />
                </Card>
                <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />
            </Stack>
        </Stack>
    );
};

const ContactListActions = () => (
    <TopToolbar>
        <SortButton
            fields={['firstName', 'lastName', 'organizationId', 'isPrimary']}
        />
        <ContactImportButton />
        <ExportButton />
        <CreateButton
            variant="contained"
            label="New Contact"
            sx={{
                marginLeft: 2,
                minHeight: 44,
                px: 3,
            }}
        />
    </TopToolbar>
);

const exporter: Exporter<Contact> = async (records, fetchRelatedRecords) => {
    const organizations = await fetchRelatedRecords<Organization>(
        records,
        'organizationId',
        'organizations'
    );
    const roleSettings = await fetchRelatedRecords<Setting>(
        records,
        'roleId',
        'settings'
    );
    const influenceSettings = await fetchRelatedRecords<Setting>(
        records,
        'influenceLevelId',
        'settings'
    );
    const decisionSettings = await fetchRelatedRecords<Setting>(
        records,
        'decisionRoleId',
        'settings'
    );

    const contacts = records.map(contact => {
        const exportedContact = {
            ...contact,
            organization: contact.organizationId
                ? organizations[contact.organizationId]?.name
                : undefined,
            role: contact.roleId
                ? roleSettings[contact.roleId]?.label
                : undefined,
            influenceLevel: contact.influenceLevelId
                ? influenceSettings[contact.influenceLevelId]?.label
                : undefined,
            decisionRole: contact.decisionRoleId
                ? decisionSettings[contact.decisionRoleId]?.label
                : undefined,
            fullName: `${contact.firstName} ${contact.lastName}`,
            primaryContact: contact.isPrimary ? 'Yes' : 'No',
        };
        return exportedContact;
    });

    return jsonExport(contacts, {}, (_err: any, csv: string) => {
        downloadCSV(csv, 'contacts');
    });
};

const BulkSetPrimaryButton = () => {
    const [updateMany] = useUpdateMany();
    const { selectedIds, data } = useListContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll('contacts');

    const handleSetPrimary = async () => {
        if (selectedIds.length === 0) return;

        try {
            // Group contacts by organization
            const contactsByOrg = new Map<number, Contact[]>();
            selectedIds.forEach(id => {
                const contact = data?.find(c => c.id === id);
                if (contact?.organizationId) {
                    const orgContacts =
                        contactsByOrg.get(contact.organizationId) || [];
                    orgContacts.push(contact);
                    contactsByOrg.set(contact.organizationId, orgContacts);
                }
            });

            // Validate: only one contact per organization should be selected
            const invalidOrgs = Array.from(contactsByOrg.entries()).filter(
                ([, contacts]) => contacts.length > 1
            );
            if (invalidOrgs.length > 0) {
                notify(
                    'Please select only one contact per organization to set as primary',
                    { type: 'warning' }
                );
                return;
            }

            // Set selected contacts as primary
            await updateMany('contacts', {
                ids: selectedIds,
                data: { isPrimary: true },
            });

            notify(
                `Successfully set ${selectedIds.length} contact(s) as primary`,
                { type: 'success' }
            );
            refresh();
            unselectAll();
        } catch (error) {
            notify('Error updating contacts', { type: 'error' });
        }
    };

    return (
        <Button
            onClick={handleSetPrimary}
            startIcon={<StarIcon />}
            disabled={selectedIds.length === 0}
        >
            Set as Primary
        </Button>
    );
};
