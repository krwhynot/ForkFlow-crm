import { Button, Stack, Typography, Box, Chip, Dialog, DialogContent, Divider } from '@/components/ui-kit';
import { useMutation } from '@tanstack/react-query';
import {
    DeleteButton,
    EditButton,
    ReferenceField,
    ReferenceManyField,
    ShowBase,
    useDataProvider,
    useNotify,
    useRecordContext,
    useRedirect,
    useRefresh,
    useUpdate,
    useGetOne,
} from 'react-admin';

import { ArchiveBoxIcon, ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';
import { CompanyAvatar } from '../companies/CompanyAvatar';
import { DialogCloseButton } from '../misc/DialogCloseButton';
import { NotesIterator } from '../notes';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Deal, Organization, Contact, Product } from '../types';
import { ContactList } from './ContactList';
import { findDealLabel } from './deal';
import { RelationshipBreadcrumbs } from '../components/navigation/RelationshipBreadcrumbs';
import { RelatedEntitiesSection } from '../components/navigation/RelatedEntitiesSection';

export const DealShow = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const handleClose = () => {
        redirect('list', 'deals');
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            className="[&_.dialog-container]:items-start"
        >
            <DialogContent className="p-0">
                {!!id ? (
                    <ShowBase id={id}>
                        <DealShowContent handleClose={handleClose} />
                    </ShowBase>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

const CLOSE_TOP_WITH_ARCHIVED = 14;
const DealShowContent = ({ handleClose }: { handleClose: () => void }) => {
    const { dealStages } = useConfigurationContext();
    const record = useRecordContext<Deal>();

    // Fetch related entities for breadcrumbs
    const { data: organization } = useGetOne<Organization>(
        'organizations',
        { id: record?.organizationId },
        { enabled: !!record?.organizationId }
    );

    const { data: contact } = useGetOne<Contact>(
        'contacts',
        { id: record?.contactId },
        { enabled: !!record?.contactId }
    );

    const { data: product } = useGetOne<Product>(
        'products',
        { id: record?.productId },
        { enabled: !!record?.productId }
    );

    if (!record) return null;

    return (
        <>
            <DialogCloseButton
                onClose={handleClose}
                top={16}
                right={10}
                color={undefined}
            />
            <Stack gap={1}>
                {record.archivedAt ? <ArchivedTitle /> : null}
                <Box className="p-2">
                    <RelationshipBreadcrumbs
                        currentEntity="opportunity"
                        showContext={true}
                        relationships={{
                            organization: organization,
                            contact: contact,
                            product: product,
                            opportunity: record,
                        }}
                    />
                </Box>
                <Box className="flex p-2">
                    <Box className="flex-1">
                        <Stack className="flex-row justify-between mb-4">
                            <Stack className="flex-row items-center gap-2">
                                <ReferenceField
                                    source="organizationId"
                                    reference="companies"
                                    link="show"
                                    className="[&_a]:no-underline"
                                >
                                    <CompanyAvatar />
                                </ReferenceField>
                                <Typography variant="h5">
                                    {record.name}
                                </Typography>
                            </Stack>
                            <Stack className="gap-1 flex-row pr-6">
                                {record.archivedAt ? (
                                    <>
                                        <UnarchiveButton record={record} />
                                        <DeleteButton />
                                    </>
                                ) : (
                                    <>
                                        <ArchiveButton record={record} />
                                        <EditButton scrollToTop={false} />
                                    </>
                                )}
                            </Stack>
                        </Stack>

                        <Box className="flex m-2">
                            <Box className="flex mr-5 flex-col">
                                <Typography
                                    className="text-gray-600"
                                    variant="caption"
                                >
                                    Expected closing date
                                </Typography>
                                <Stack className="flex-row items-center gap-1">
                                    <Typography variant="body2">
                                        {record.expectedClosingDate
                                            ? new Date(
                                                  record.expectedClosingDate
                                              ).toLocaleDateString()
                                            : ''}
                                    </Typography>
                                    {record.expectedClosingDate ? (
                                        new Date(record.expectedClosingDate) <
                                        new Date()
                                    ) : false ? (
                                        <Chip
                                            label="Past"
                                            color="error"
                                            size="small"
                                        />
                                    ) : null}
                                </Stack>
                            </Box>

                            <Box className="flex mr-5 flex-col">
                                <Typography
                                    className="text-gray-600"
                                    variant="caption"
                                >
                                    Budget
                                </Typography>
                                <Typography variant="body2">
                                    {(record.amount ?? 0).toLocaleString(
                                        'en-US',
                                        {
                                            notation: 'compact',
                                            style: 'currency',
                                            currency: 'USD',
                                            currencyDisplay: 'narrowSymbol',
                                            minimumSignificantDigits: 3,
                                        }
                                    )}
                                </Typography>
                            </Box>

                            <Box className="flex mr-5 flex-col">
                                <Typography
                                    className="text-gray-600"
                                    variant="caption"
                                >
                                    Stage
                                </Typography>
                                <Typography variant="body2">
                                    {findDealLabel(dealStages, record.stage)}
                                </Typography>
                            </Box>
                        </Box>

                        {record.contactId && (
                            <Box className="m-2">
                                <Box className="flex mr-5 flex-col min-h-[48px]">
                                    <Typography
                                        className="text-gray-600"
                                        variant="caption"
                                    >
                                        Contact
                                    </Typography>
                                    <ReferenceField
                                        source="contactId"
                                        reference="contacts"
                                    >
                                        <ContactList />
                                    </ReferenceField>
                                </Box>
                            </Box>
                        )}

                        {record.description && (
                            <Box className="m-2 whitespace-pre-line">
                                <Typography
                                    className="text-gray-600"
                                    variant="caption"
                                >
                                    Description
                                </Typography>
                                <Typography variant="body2">
                                    {record.description}
                                </Typography>
                            </Box>
                        )}

                        <Box className="m-2">
                            <Divider className="mb-3" />

                            {/* Related Interactions */}
                            <RelatedEntitiesSection
                                entityType="opportunity"
                                title="Related Interactions"
                                relatedType="interactions"
                                filter={{ opportunityId: record?.id }}
                                maxItems={3}
                                createLink={`/interactions/create?opportunityId=${record?.id}&organizationId=${record?.organizationId}&contactId=${record?.contactId}`}
                                viewAllLink={`/interactions?filter=${JSON.stringify({ opportunityId: record?.id })}`}
                                emptyMessage="No interactions recorded for this opportunity yet."
                            />

                            <Divider className="my-3" />

                            <ReferenceManyField
                                target="deal_id"
                                reference="dealNotes"
                                sort={{ field: 'date', order: 'DESC' }}
                            >
                                <NotesIterator reference="deals" />
                            </ReferenceManyField>
                        </Box>
                    </Box>
                </Box>
            </Stack>
        </>
    );
};

const ArchivedTitle = () => (
    <Box className="bg-yellow-500 px-3 py-2">
        <Typography
            variant="h6"
            className="font-bold text-white"
        >
            Archived Deal
        </Typography>
    </Box>
);

const ArchiveButton = ({ record }: { record: Deal }) => {
    const [update] = useUpdate();
    const redirect = useRedirect();
    const notify = useNotify();
    const refresh = useRefresh();
    const handleClick = () => {
        update(
            'deals',
            {
                id: record.id,
                data: { archivedAt: new Date().toISOString() },
                previousData: record,
            },
            {
                onSuccess: () => {
                    redirect('list', 'deals');
                    notify('Deal archived', { type: 'info', undoable: false });
                    refresh();
                },
                onError: () => {
                    notify('Error: deal not archived', { type: 'error' });
                },
            }
        );
    };

    return (
        <Button onClick={handleClick} startIcon={<ArchiveBoxIcon className="w-4 h-4" />} size="small">
            Archive
        </Button>
    );
};

const UnarchiveButton = ({ record }: { record: Deal }) => {
    const dataProvider = useDataProvider();
    const redirect = useRedirect();
    const notify = useNotify();
    const refresh = useRefresh();

    const { mutate } = useMutation({
        mutationFn: () => dataProvider.unarchiveDeal(record),
        onSuccess: () => {
            redirect('list', 'deals');
            notify('Deal unarchived', {
                type: 'info',
                undoable: false,
            });
            refresh();
        },
        onError: () => {
            notify('Error: deal not unarchived', { type: 'error' });
        },
    });

    const handleClick = () => {
        mutate();
    };

    return (
        <Button
            onClick={handleClick}
            startIcon={<ArchiveBoxArrowDownIcon className="w-4 h-4" />}
            size="small"
        >
            Send back to the board
        </Button>
    );
};
