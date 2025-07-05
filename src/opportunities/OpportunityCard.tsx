import { Draggable } from '@hello-pangea/dnd';
import {
    BuildingOffice2Icon as BusinessIcon,
    PencilSquareIcon as EditIcon,
    CurrencyDollarIcon as MoneyIcon,
    UserIcon as PersonIcon,
    EyeIcon as ViewIcon,
} from '@heroicons/react/24/outline';
import { ReferenceField, TextField, useRedirect } from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    LinearProgress,
    Stack,
    Typography,
} from '../components/ui-kit';

export const OpportunityCard = ({
    opportunity,
    index,
}: {
    opportunity: any;
    index: number;
}) => {
    if (!opportunity) return null;

    return (
        <Draggable draggableId={String(opportunity.id)} index={index}>
            {(provided, snapshot) => (
                <OpportunityCardContent
                    provided={provided}
                    snapshot={snapshot}
                    opportunity={opportunity}
                />
            )}
        </Draggable>
    );
};

export const OpportunityCardContent = ({
    provided,
    snapshot,
    opportunity,
}: {
    provided?: any;
    snapshot?: any;
    opportunity: any;
}) => {
    const redirect = useRedirect();

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        redirect(`/opportunities/${opportunity.id}/show`);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        redirect(`/opportunities/${opportunity.id}`);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Format probability
    const probability = opportunity.probability || 0;

    return (
        <Box
            className={`mb-2 cursor-pointer transition-all ${
                snapshot?.isDragging ? 'rotate-1 opacity-90' : 'rotate-0 opacity-100'
            }`}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided?.innerRef}
        >
            <Card
                className="transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-1 min-h-40"
            >
                <CardContent className="p-4">
                    {/* Header with Actions */}
                    <Box className="flex justify-between items-start mb-4">
                        <Typography
                            variant="subtitle1"
                            className="font-semibold leading-tight text-sm flex-grow mr-2"
                        >
                            {opportunity.name || 'Untitled Opportunity'}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                            <IconButton
                                size="small"
                                onClick={handleView}
                                className="min-w-11 min-h-11 p-2"
                            >
                                <ViewIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleEdit}
                                className="min-w-11 min-h-11 p-2"
                            >
                                <EditIcon className="h-4 w-4" />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* Organization & Contact */}
                    <Stack spacing={1} className="mb-4">
                        <Box className="flex items-center gap-2">
                            <BusinessIcon
                                className="h-4 w-4 text-gray-500"
                                aria-hidden="true"
                            />
                            <ReferenceField
                                source="organizationId"
                                reference="organizations"
                                link={false}
                                record={opportunity}
                            >
                                <TextField
                                    source="name"
                                    variant="body2"
                                    className="text-sm"
                                />
                            </ReferenceField>
                        </Box>

                        {opportunity.contactId && (
                            <Box className="flex items-center gap-2">
                                <PersonIcon
                                    className="h-4 w-4 text-gray-500"
                                    aria-hidden="true"
                                />
                                <ReferenceField
                                    source="contactId"
                                    reference="contacts"
                                    link={false}
                                    record={opportunity}
                                >
                                    <Typography
                                        variant="body2"
                                        className="text-sm"
                                    >
                                        <TextField source="firstName" />{' '}
                                        <TextField source="lastName" />
                                    </Typography>
                                </ReferenceField>
                            </Box>
                        )}
                    </Stack>

                    {/* Value and Probability */}
                    <Box className="mb-4">
                        <Box className="flex items-center justify-between mb-2">
                            <Box className="flex items-center gap-2">
                                <MoneyIcon
                                    className="h-4 w-4 text-green-500"
                                    aria-hidden="true"
                                />
                                <Typography
                                    variant="h6"
                                    className="font-semibold text-base text-green-600"
                                >
                                    {formatCurrency(opportunity.amount || 0)}
                                </Typography>
                            </Box>
                            <Chip
                                label={`${probability}%`}
                                size="small"
                                className={`min-w-12 text-xs ${
                                    probability >= 80
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : probability >= 50
                                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                            />
                        </Box>

                        {/* Probability Progress Bar */}
                        <LinearProgress
                            variant="determinate"
                            value={probability}
                            className={`h-1 rounded bg-gray-200 ${
                                probability >= 80
                                    ? '[&_.progress-bar]:bg-green-600'
                                    : probability >= 50
                                        ? '[&_.progress-bar]:bg-amber-600'
                                        : '[&_.progress-bar]:bg-blue-600'
                            }`}
                        />
                    </Box>

                    {/* Expected Close Date */}
                    {opportunity.expectedClosingDate && (
                        <Typography
                            variant="caption"
                            className="text-xs text-gray-600"
                        >
                            Expected close:{' '}
                            {new Date(
                                opportunity.expectedClosingDate
                            ).toLocaleDateString()}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};
