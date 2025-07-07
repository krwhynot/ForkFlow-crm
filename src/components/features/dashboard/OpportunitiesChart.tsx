import React from 'react';

interface OpportunityStage {
  stage: string;
  count: number;
  color: string;
}

interface OpportunitiesChartProps {
  data: OpportunityStage[];
}

export const OpportunitiesChart: React.FC<OpportunitiesChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Week's Total Opportunities by Stage
      </h3>
      <div className="flex items-end justify-between space-x-2" style={{ height: '150px' }}>
        {data.map((stage) => (
          <div key={stage.stage} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full rounded-t"
              style={{
                backgroundColor: stage.color,
                height: `${(stage.count / maxCount) * 100}%`,
                minHeight: '20px'
              }}
            />
            <p className="text-xs text-gray-600 mt-2">{stage.stage}</p>
          </div>
        ))}
      </div>
    </div>
  );
};