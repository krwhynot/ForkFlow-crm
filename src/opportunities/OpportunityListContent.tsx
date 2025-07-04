import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import isEqual from 'lodash/isEqual';
import { useEffect, useState } from 'react';
import { DataProvider, useDataProvider, useListContext } from 'react-admin';

import { Deal } from '../types';
import { OpportunityColumn } from './OpportunityColumn';
import { OpportunitiesByStage, getOpportunitiesByStage } from './stages';

// Food Service Pipeline Stages
const FOOD_SERVICE_STAGES = [
    { id: 'lead_discovery', name: 'Lead Discovery', color: '#e3f2fd' },
    { id: 'contacted', name: 'Contacted', color: '#f3e5f5' },
    { id: 'sampled_visited', name: 'Sampled/Visited', color: '#e8f5e8' },
    { id: 'follow_up', name: 'Follow-up', color: '#fff3e0' },
    { id: 'close', name: 'Close', color: '#e0f2f1' },
];

export const OpportunityListContent = () => {
    const {
        data: unorderedOpportunities,
        isPending,
        refetch,
    } = useListContext<Deal>();
    const dataProvider = useDataProvider();

    const [opportunitiesByStage, setOpportunitiesByStage] =
        useState<OpportunitiesByStage>(
            getOpportunitiesByStage([], FOOD_SERVICE_STAGES)
        );

    useEffect(() => {
        if (unorderedOpportunities) {
            const newOpportunitiesByStage = getOpportunitiesByStage(
                unorderedOpportunities,
                FOOD_SERVICE_STAGES
            );
            if (!isEqual(newOpportunitiesByStage, opportunitiesByStage)) {
                setOpportunitiesByStage(newOpportunitiesByStage);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unorderedOpportunities]);

    if (isPending) return null;

    const onDragEnd: OnDragEndResponder = result => {
        const { destination, source } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const sourceStage = source.droppableId;
        const destinationStage = destination.droppableId;
        const sourceOpportunity =
            opportunitiesByStage[sourceStage][source.index]!;
        const destinationOpportunity =
            opportunitiesByStage[destinationStage][destination.index];

        const newOpportunitiesByStage = { ...opportunitiesByStage };

        // Remove from source
        newOpportunitiesByStage[sourceStage] = [
            ...opportunitiesByStage[sourceStage],
        ];
        newOpportunitiesByStage[sourceStage].splice(source.index, 1);

        // Insert in destination
        newOpportunitiesByStage[destinationStage] = [
            ...opportunitiesByStage[destinationStage],
        ];
        newOpportunitiesByStage[destinationStage].splice(
            destination.index,
            0,
            sourceOpportunity
        );

        setOpportunitiesByStage(newOpportunitiesByStage);

        // Update stage in database
        updateOpportunityStage(
            dataProvider,
            sourceOpportunity,
            destinationStage,
            destinationOpportunity
        );
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Box
                display="flex"
                sx={{
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    minHeight: '70vh',
                    gap: 2,
                    p: 2,
                }}
            >
                {FOOD_SERVICE_STAGES.map(stage => (
                    <OpportunityColumn
                        key={stage.id}
                        stage={stage}
                        opportunities={opportunitiesByStage[stage.id] || []}
                    />
                ))}
            </Box>
        </DragDropContext>
    );
};

const updateOpportunityStage = async (
    dataProvider: DataProvider,
    opportunity: Deal,
    newStage: string,
    destinationOpportunity?: Deal
) => {
    try {
        await dataProvider.update('deals', {
            id: opportunity.id,
            data: {
                stage: newStage,
                index: destinationOpportunity
                    ? destinationOpportunity.index
                    : 0,
                updatedAt: new Date().toISOString(),
            },
            previousData: opportunity,
        });
    } catch (error) {
        console.error('Error updating opportunity stage:', error);
    }
};
