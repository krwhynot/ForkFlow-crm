import { Droppable } from '@hello-pangea/dnd';
import { Box, Chip, Paper, Typography } from '../components/ui-kit';
import { Deal } from '../types';
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
            className="min-w-[300px] max-w-[300px] rounded-lg overflow-hidden"
            style={{ backgroundColor: stage.color }}
        >
            {/* Stage Header */}
            <Box
                className="p-2 border-b border-gray-200 bg-white"
            >
                <Box
                    className="flex justify-between items-center mb-1"
                >
                    <Typography variant="h6" className="font-semibold">
                        {stage.name}
                    </Typography>
                    <Chip
                        label={opportunityCount}
                        size="small"
                        color="primary"
                        className="min-w-[24px]"
                    />
                </Box>
                <Typography variant="body2" className="text-gray-600">
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
                        className={`min-h-[400px] max-h-[600px] overflow-y-auto p-1 transition-colors duration-200 ${
                            snapshot.isDraggingOver
                                ? 'bg-gray-50'
                                : 'bg-transparent'
                        }`}
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
                                className="text-center py-4 text-gray-500"
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
