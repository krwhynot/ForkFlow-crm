import { Droppable } from '@hello-pangea/dnd';
import { Box, Chip, Paper, Typography } from '../components/ui-kit';
import { OpportunityCard } from './OpportunityCard';
import { FoodServiceStage } from './stages';

export const OpportunityColumn = ({
    stage,
    opportunities,
}: {
    stage: FoodServiceStage;
    opportunities: Deal[];
}) => {
    // Calculate total value for this stage
    const totalValue = opportunities.reduce(
        (sum, opp) => sum + (opp.amount || 0),
        0
    );
    const opportunityCount = opportunities.length;

    return (
        <Paper
            sx={{
                minWidth: 300,
                maxWidth: 300,
                backgroundColor: stage.color,
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            {/* Stage Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {stage.name}
                    </Typography>
                    <Chip
                        label={opportunityCount}
                        size="small"
                        color="primary"
                        sx={{ minWidth: 24 }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Total:{' '}
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(totalValue)}
                </Typography>
            </Box>

            {/* Droppable Area */}
            <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            minHeight: 400,
                            maxHeight: 600,
                            overflowY: 'auto',
                            p: 1,
                            backgroundColor: snapshot.isDraggingOver
                                ? 'action.hover'
                                : 'transparent',
                            transition: 'background-color 0.2s ease',
                        }}
                    >
                        {opportunities.map((opportunity, index) => (
                            <OpportunityCard
                                key={opportunity.id}
                                opportunity={opportunity}
                                index={index}
                            />
                        ))}
                        {provided.placeholder}

                        {/* Empty State */}
                        {opportunities.length === 0 && (
                            <Box
                                sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary',
                                }}
                            >
                                <Typography variant="body2">
                                    No opportunities in this stage
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Droppable>
        </Paper>
    );
};
