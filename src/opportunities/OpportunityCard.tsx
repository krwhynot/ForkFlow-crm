import { Draggable } from '@hello-pangea/dnd';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Stack,
    LinearProgress,
} from '@mui/material';
import {
    Business as BusinessIcon,
    Person as PersonIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Link, ReferenceField, TextField, useRedirect } from 'react-admin';
import { Deal } from '../types';

export const OpportunityCard = ({ 
    opportunity, 
    index 
}: { 
    opportunity: Deal; 
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
    opportunity: Deal;
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
            sx={{ 
                mb: 1, 
                cursor: 'pointer',
                transform: snapshot?.isDragging ? 'rotate(-2deg)' : 'none',
                opacity: snapshot?.isDragging ? 0.9 : 1,
            }}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            ref={provided?.innerRef}
        >
            <Card
                sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)',
                    },
                    minHeight: 160,
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    {/* Header with Actions */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 2 
                    }}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 600,
                                lineHeight: 1.2,
                                fontSize: '0.95rem',
                                flexGrow: 1,
                                mr: 1,
                            }}
                        >
                            {opportunity.name || 'Untitled Opportunity'}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                            <IconButton
                                size="small"
                                onClick={handleView}
                                sx={{ 
                                    minWidth: 44, 
                                    minHeight: 44,
                                    padding: 1,
                                }}
                            >
                                <ViewIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleEdit}
                                sx={{ 
                                    minWidth: 44, 
                                    minHeight: 44,
                                    padding: 1,
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>

                    {/* Organization & Contact */}
                    <Stack spacing={1} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon 
                                sx={{ 
                                    fontSize: 16, 
                                    mr: 1, 
                                    color: 'text.secondary' 
                                }} 
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
                                    sx={{ fontSize: '0.875rem' }}
                                />
                            </ReferenceField>
                        </Box>
                        
                        {opportunity.contactId && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon 
                                    sx={{ 
                                        fontSize: 16, 
                                        mr: 1, 
                                        color: 'text.secondary' 
                                    }} 
                                />
                                <ReferenceField
                                    source="contactId"
                                    reference="contacts"
                                    link={false}
                                    record={opportunity}
                                >
                                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                        <TextField source="firstName" /> <TextField source="lastName" />
                                    </Typography>
                                </ReferenceField>
                            </Box>
                        )}
                    </Stack>

                    {/* Value and Probability */}
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <MoneyIcon 
                                    sx={{ 
                                        fontSize: 18, 
                                        mr: 0.5, 
                                        color: 'success.main' 
                                    }} 
                                />
                                <Typography 
                                    variant="h6" 
                                    color="success.main"
                                    sx={{ fontWeight: 600, fontSize: '1rem' }}
                                >
                                    {formatCurrency(opportunity.amount || 0)}
                                </Typography>
                            </Box>
                            <Chip
                                label={`${probability}%`}
                                size="small"
                                color={probability >= 80 ? 'success' : probability >= 50 ? 'warning' : 'default'}
                                sx={{ 
                                    minWidth: 48,
                                    fontSize: '0.75rem',
                                }}
                            />
                        </Box>
                        
                        {/* Probability Progress Bar */}
                        <LinearProgress
                            variant="determinate"
                            value={probability}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    backgroundColor: 
                                        probability >= 80 ? 'success.main' :
                                        probability >= 50 ? 'warning.main' : 'primary.main',
                                },
                            }}
                        />
                    </Box>

                    {/* Expected Close Date */}
                    {opportunity.expectedClosingDate && (
                        <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                        >
                            Expected close: {new Date(opportunity.expectedClosingDate).toLocaleDateString()}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};