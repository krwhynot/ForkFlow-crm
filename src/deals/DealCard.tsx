import { Draggable } from '@hello-pangea/dnd';
import { Box, Card, Typography } from '@/components/ui-kit';
import { ReferenceField, useRedirect } from 'react-admin';
import { CompanyAvatar } from '../companies/CompanyAvatar';
import { Deal } from '../types';

export const DealCard = ({ deal, index }: { deal: Deal; index: number }) => {
    if (!deal) return null;

    return (
        <Draggable draggableId={String(deal.id)} index={index}>
            {(provided, snapshot) => (
                <DealCardContent
                    provided={provided}
                    snapshot={snapshot}
                    deal={deal}
                />
            )}
        </Draggable>
    );
};

export const DealCardContent = ({
    provided,
    snapshot,
    deal,
}: {
    provided?: any;
    snapshot?: any;
    deal: Deal;
}) => {
    const redirect = useRedirect();
    const handleClick = () => {
        redirect(`/deals/${deal.id}/show`, undefined, undefined, undefined, {
            _scrollToTop: false,
        });
    };

    return (
        <Box
            className="mb-1 cursor-pointer"
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided?.innerRef}
            onClick={handleClick}
        >
            <Card
                className={`transition-all duration-200 ease-in-out ${
                    snapshot?.isDragging ? 'shadow-xl' : 'shadow-md'
                }`}
                style={{
                    opacity: snapshot?.isDragging ? 0.9 : 1,
                    transform: snapshot?.isDragging ? 'rotate(-2deg)' : '',
                }}
            >
                <Box className="p-1 flex">
                    <ReferenceField
                        source="organizationId"
                        record={deal}
                        reference="companies"
                        link={false}
                    >
                        <CompanyAvatar width={20} height={20} />
                    </ReferenceField>
                    <Box className="ml-1">
                        <Typography variant="body2" className="mb-1">
                            {deal.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500">
                            {(deal.amount ?? 0).toLocaleString('en-US', {
                                notation: 'compact',
                                style: 'currency',
                                currency: 'USD',
                                currencyDisplay: 'narrowSymbol',
                                minimumSignificantDigits: 3,
                            })}
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};
