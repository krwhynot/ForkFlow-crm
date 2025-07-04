import { UserPlusIcon } from '@heroicons/react/24/outline';
import { Box, Button, Card, List, ListItem, ListItemAvatar, ListItemButton, ListItemSecondaryAction, ListItemText } from '../components/ui-kit';
import { formatDistance } from 'date-fns';
import {
    RecordContextProvider,
    ReferenceManyField,
    ShowBase,
    SortButton,
    TabbedShowLayout,
    useListContext,
    useRecordContext,
    useShowContext,
} from 'react-admin';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import { ActivityLog } from '../activity/ActivityLog';
import { Avatar } from '../contacts/Avatar';
import { TagsList } from '../contacts/TagsList';
import { findDealLabel } from '../deals/deal';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Company, Contact, Deal } from '../types';
import { CompanyAside } from './CompanyAside';
import { CompanyAvatar } from './CompanyAvatar';

export const CompanyShow = () => (
    <ShowBase>
        <CompanyShowContent />
    </ShowBase>
);

const CompanyShowContent = () => {
    const { record, isPending } = useShowContext<Company>();

    if (isPending || !record) return null;

    return (
        <Box className="mt-2 flex">
            <Box className="flex-1">
                <Card className="p-6">
                    <Box className="flex mb-1">
                        <CompanyAvatar />
                        <h1 className="text-xl font-semibold ml-2 flex-1">
                            {record.name}
                        </h1>
                    </Box>

                    <TabbedShowLayout
                        className="[&_.RaTabbedShowLayout-content]:p-0"
                    >
                        <TabbedShowLayout.Tab label="Activity">
                            <ActivityLog
                                companyId={record.id}
                                context="company"
                            />
                        </TabbedShowLayout.Tab>
                        <TabbedShowLayout.Tab
                            label={
                                !record.nb_contacts
                                    ? 'No Contacts'
                                    : record.nb_contacts === 1
                                      ? '1 Contact'
                                      : `${record.nb_contacts} Contacts`
                            }
                            path="contacts"
                        >
                            <ReferenceManyField
                                reference="contacts_summary"
                                target="organizationId"
                                sort={{ field: 'last_name', order: 'ASC' }}
                            >
                                <Box className="flex flex-row justify-end gap-2 mt-1">
                                    {!!record.nb_contacts && (
                                        <SortButton
                                            fields={[
                                                'last_name',
                                                'first_name',
                                                'last_seen',
                                            ]}
                                        />
                                    )}
                                    <CreateRelatedContactButton />
                                </Box>
                                <ContactsIterator />
                            </ReferenceManyField>
                        </TabbedShowLayout.Tab>
                        {record.nb_deals ? (
                            <TabbedShowLayout.Tab
                                label={
                                    record.nb_deals === 1
                                        ? '1 deal'
                                        : `${record.nb_deals} deals`
                                }
                                path="deals"
                            >
                                <ReferenceManyField
                                    reference="deals"
                                    target="organizationId"
                                    sort={{ field: 'name', order: 'ASC' }}
                                >
                                    <DealsIterator />
                                </ReferenceManyField>
                            </TabbedShowLayout.Tab>
                        ) : null}
                    </TabbedShowLayout>
                </Card>
            </Box>
            <CompanyAside />
        </Box>
    );
};

const ContactsIterator = () => {
    const location = useLocation();
    const { data: contacts, error, isPending } = useListContext<Contact>();

    if (isPending || error) return null;

    const now = Date.now();
    return (
        <List dense className="pt-0">
            {contacts.map(contact => (
                <RecordContextProvider key={contact.id} value={contact}>
                    <ListItem disablePadding>
                        <ListItemButton
                            component={RouterLink}
                            to={`/contacts/${contact.id}/show`}
                            state={{ from: location.pathname }}
                        >
                            <ListItemAvatar>
                                <Avatar />
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${contact.first_name} ${contact.last_name}`}
                                secondary={
                                    <>
                                        {contact.title}
                                        {contact.nb_tasks
                                            ? ` - ${contact.nb_tasks} task${
                                                  contact.nb_tasks > 1
                                                      ? 's'
                                                      : ''
                                              }`
                                            : ''}
                                        &nbsp; &nbsp;
                                        <TagsList />
                                    </>
                                }
                            />
                            {contact.last_seen && (
                                <ListItemSecondaryAction>
                                    <span className="text-sm text-gray-600">
                                        last activity{' '}
                                        {formatDistance(contact.last_seen, now)}{' '}
                                        ago
                                    </span>
                                </ListItemSecondaryAction>
                            )}
                        </ListItemButton>
                    </ListItem>
                </RecordContextProvider>
            ))}
        </List>
    );
};

const CreateRelatedContactButton = () => {
    const company = useRecordContext<Company>();
    return (
        <Button
            component={RouterLink}
            to="/contacts/create"
            state={
                company ? { record: { organizationId: company.id } } : undefined
            }
            color="primary"
            size="small"
            startIcon={<UserPlusIcon className="h-4 w-4" />}
        >
            Add contact
        </Button>
    );
};

const DealsIterator = () => {
    const { data: deals, error, isPending } = useListContext<Deal>();
    const { dealStages } = useConfigurationContext();
    if (isPending || error) return null;

    const now = Date.now();
    return (
        <Box>
            <List dense>
                {deals.map(deal => (
                    <ListItem disablePadding key={deal.id}>
                        <ListItemButton
                            component={RouterLink}
                            to={`/deals/${deal.id}/show`}
                        >
                            <ListItemText
                                primary={deal.name}
                                secondary={
                                    <>
                                        {findDealLabel(dealStages, deal.stage)},{' '}
                                        {deal.amount.toLocaleString('en-US', {
                                            notation: 'compact',
                                            style: 'currency',
                                            currency: 'USD',
                                            currencyDisplay: 'narrowSymbol',
                                            minimumSignificantDigits: 3,
                                        })}
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <span className="text-sm text-gray-600">
                                    last activity{' '}
                                    {formatDistance(deal.updatedAt, now)}{' '}
                                    ago{' '}
                                </span>
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};
