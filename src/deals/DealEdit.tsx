import {
    Button,
    Stack,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@/components/ui-kit';
import {
    DeleteButton,
    EditBase,
    Form,
    ReferenceField,
    SaveButton,
    Toolbar,
    useNotify,
    useRecordContext,
    useRedirect,
} from 'react-admin';
import { Link } from 'react-router-dom';
import { CompanyAvatar } from '../companies/CompanyAvatar';
import { DialogCloseButton } from '../misc/DialogCloseButton';
import { Deal } from '../types';
import { DealInputs } from './DealInputs';

export const DealEdit = ({ open, id }: { open: boolean; id?: string }) => {
    const redirect = useRedirect();
    const notify = useNotify();

    const handleClose = () => {
        redirect('/deals', undefined, undefined, undefined, {
            _scrollToTop: false,
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} className="max-w-3xl">
            {!!id ? (
                <EditBase
                    id={id}
                    mutationMode="pessimistic"
                    mutationOptions={{
                        onSuccess: () => {
                            notify('Deal updated');
                            redirect(
                                `/deals/${id}/show`,
                                undefined,
                                undefined,
                                undefined,
                                {
                                    _scrollToTop: false,
                                }
                            );
                        },
                    }}
                >
                    <DialogCloseButton onClose={handleClose} top={13} />
                    <EditHeader />
                    <Form>
                        <DialogContent>
                            <DealInputs />
                        </DialogContent>
                        <EditToolbar />
                    </Form>
                </EditBase>
            ) : null}
        </Dialog>
    );
};

function EditHeader() {
    const deal = useRecordContext<Deal>();
    if (!deal) {
        return null;
    }

    return (
        <DialogTitle>
            <Stack
                direction="row"
                className="items-center justify-between"
                gap={1}
            >
                <Stack direction="row" className="items-center" gap={2}>
                    <ReferenceField
                        source="organizationId"
                        reference="companies"
                        link="show"
                    >
                        <CompanyAvatar />
                    </ReferenceField>
                    <Typography variant="h6">Edit {deal.name} deal</Typography>
                </Stack>

                <Stack direction="row" gap={1} className="pr-3">
                    <Button
                        // @ts-ignore
                        component={Link}
                        to={`/deals/${deal.id}/show`}
                        size="small"
                    >
                        Back to deal
                    </Button>
                </Stack>
            </Stack>
        </DialogTitle>
    );
}

function EditToolbar() {
    return (
        <Toolbar className="flex justify-between">
            <SaveButton />
            <DeleteButton mutationMode="undoable" />
        </Toolbar>
    );
}
