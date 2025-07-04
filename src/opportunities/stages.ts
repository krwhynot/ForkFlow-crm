import { Deal } from '../types';

export interface FoodServiceStage {
    id: string;
    name: string;
    color: string;
}

export type OpportunitiesByStage = {
    [key: string]: Deal[];
};

export const getOpportunitiesByStage = (
    opportunities: Deal[],
    stages: FoodServiceStage[]
): OpportunitiesByStage => {
    const opportunitiesByStage: OpportunitiesByStage = {};

    // Initialize all stages
    stages.forEach(stage => {
        opportunitiesByStage[stage.id] = [];
    });

    // Group opportunities by stage
    opportunities.forEach(opportunity => {
        const stageId = opportunity.stage || 'lead_discovery';
        if (opportunitiesByStage[stageId]) {
            opportunitiesByStage[stageId].push(opportunity);
        } else {
            // Fallback to lead_discovery if stage doesn't exist
            opportunitiesByStage['lead_discovery'].push(opportunity);
        }
    });

    // Sort opportunities within each stage by index
    Object.keys(opportunitiesByStage).forEach(stageId => {
        opportunitiesByStage[stageId].sort(
            (a, b) => (b.index || 0) - (a.index || 0)
        );
    });

    return opportunitiesByStage;
};

// Food Service Pipeline Stage Definitions
export const FOOD_SERVICE_PIPELINE_STAGES: FoodServiceStage[] = [
    {
        id: 'lead_discovery',
        name: 'Lead Discovery',
        color: '#e3f2fd', // Light blue
    },
    {
        id: 'contacted',
        name: 'Contacted',
        color: '#f3e5f5', // Light purple
    },
    {
        id: 'sampled_visited',
        name: 'Sampled/Visited',
        color: '#e8f5e8', // Light green
    },
    {
        id: 'follow_up',
        name: 'Follow-up',
        color: '#fff3e0', // Light orange
    },
    {
        id: 'close',
        name: 'Close',
        color: '#e0f2f1', // Light teal
    },
];

// Helper function to get stage info by ID
export const getStageInfo = (stageId: string): FoodServiceStage | undefined => {
    return FOOD_SERVICE_PIPELINE_STAGES.find(stage => stage.id === stageId);
};

// Helper function to calculate stage progression percentage
export const calculateStageProgress = (stageId: string): number => {
    const stageIndex = FOOD_SERVICE_PIPELINE_STAGES.findIndex(
        stage => stage.id === stageId
    );
    return stageIndex >= 0
        ? ((stageIndex + 1) / FOOD_SERVICE_PIPELINE_STAGES.length) * 100
        : 0;
};
