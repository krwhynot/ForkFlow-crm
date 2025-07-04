import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { twMerge } from 'tailwind-merge';

// Common chart theme using Tailwind colors
const chartTheme = {
    background: 'transparent',
    text: {
        fontSize: 12,
        fill: '#6B7280', // text-gray-500
        outlineWidth: 0,
        outlineColor: 'transparent',
    },
    axis: {
        domain: {
            line: {
                stroke: '#E5E7EB', // border-gray-200
                strokeWidth: 1,
            },
        },
        legend: {
            text: {
                fontSize: 12,
                fill: '#374151', // text-gray-700
            },
        },
        ticks: {
            line: {
                stroke: '#E5E7EB', // border-gray-200
                strokeWidth: 1,
            },
            text: {
                fontSize: 11,
                fill: '#6B7280', // text-gray-500
            },
        },
    },
    grid: {
        line: {
            stroke: '#F3F4F6', // bg-gray-100
            strokeWidth: 1,
        },
    },
    legends: {
        title: {
            text: {
                fontSize: 11,
                fill: '#374151', // text-gray-700
            },
        },
        text: {
            fontSize: 11,
            fill: '#6B7280', // text-gray-500
        },
        ticks: {
            line: {},
            text: {
                fontSize: 10,
                fill: '#6B7280', // text-gray-500
            },
        },
    },
    annotations: {
        text: {
            fontSize: 13,
            fill: '#374151', // text-gray-700
            outlineWidth: 2,
            outlineColor: '#ffffff',
            outlineOpacity: 1,
        },
        link: {
            stroke: '#374151', // text-gray-700
            strokeWidth: 1,
            outlineWidth: 2,
            outlineColor: '#ffffff',
            outlineOpacity: 1,
        },
        outline: {
            stroke: '#374151', // text-gray-700
            strokeWidth: 2,
            outlineWidth: 2,
            outlineColor: '#ffffff',
            outlineOpacity: 1,
        },
        symbol: {
            fill: '#374151', // text-gray-700
            outlineWidth: 2,
            outlineColor: '#ffffff',
            outlineOpacity: 1,
        },
    },
    tooltip: {
        container: {
            background: '#ffffff',
            color: '#1F2937', // text-gray-800
            fontSize: 12,
            borderRadius: '6px',
            boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB', // border-gray-200
        },
    },
};

// Default color scheme using Tailwind colors
const defaultColors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#84CC16', // lime-500
    '#F97316', // orange-500
];

interface ChartContainerProps {
    height?: number;
    className?: string;
    children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
    height = 300,
    className = '',
    children,
}) => {
    return (
        <div
            className={twMerge(
                'w-full bg-white border border-gray-200 rounded-lg p-4',
                className
            )}
            style={{ height }}
        >
            {children}
        </div>
    );
};

interface BarChartProps {
    data: any[];
    keys: string[];
    indexBy: string;
    height?: number;
    className?: string;
    colors?: string[];
    margin?: { top: number; right: number; bottom: number; left: number };
    axisBottom?: any;
    axisLeft?: any;
    enableLabel?: boolean;
    enableGridX?: boolean;
    enableGridY?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
    data,
    keys,
    indexBy,
    height = 300,
    className = '',
    colors = defaultColors,
    margin = { top: 20, right: 20, bottom: 60, left: 60 },
    axisBottom,
    axisLeft,
    enableLabel = true,
    enableGridX = false,
    enableGridY = true,
}) => {
    return (
        <ChartContainer height={height} className={className}>
            <ResponsiveBar
                data={data}
                keys={keys}
                indexBy={indexBy}
                margin={margin}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={colors}
                theme={chartTheme}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={
                    axisBottom || {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: indexBy,
                        legendPosition: 'middle',
                        legendOffset: 32,
                    }
                }
                axisLeft={
                    axisLeft || {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Value',
                        legendPosition: 'middle',
                        legendOffset: -40,
                    }
                }
                enableGridX={enableGridX}
                enableGridY={enableGridY}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{
                    from: 'color',
                    modifiers: [['darker', 1.6]],
                }}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                enableLabel={enableLabel}
            />
        </ChartContainer>
    );
};

interface LineChartProps {
    data: any[];
    height?: number;
    className?: string;
    colors?: string[];
    margin?: { top: number; right: number; bottom: number; left: number };
    xScale?: any;
    yScale?: any;
    axisBottom?: any;
    axisLeft?: any;
    enablePoints?: boolean;
    enableGridX?: boolean;
    enableGridY?: boolean;
    curve?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
    data,
    height = 300,
    className = '',
    colors = defaultColors,
    margin = { top: 20, right: 20, bottom: 60, left: 60 },
    xScale = { type: 'point' },
    yScale = {
        type: 'linear',
        min: 'auto',
        max: 'auto',
        stacked: false,
        reverse: false,
    },
    axisBottom,
    axisLeft,
    enablePoints = true,
    enableGridX = false,
    enableGridY = true,
    curve = 'cardinal',
}) => {
    return (
        <ChartContainer height={height} className={className}>
            <ResponsiveLine
                data={data}
                margin={margin}
                xScale={xScale}
                yScale={yScale}
                theme={chartTheme}
                colors={colors}
                curve={curve as any}
                axisTop={null}
                axisRight={null}
                axisBottom={
                    axisBottom || {
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'X Axis',
                        legendOffset: 36,
                        legendPosition: 'middle',
                    }
                }
                axisLeft={
                    axisLeft || {
                        orient: 'left',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Y Axis',
                        legendOffset: -40,
                        legendPosition: 'middle',
                    }
                }
                enableGridX={enableGridX}
                enableGridY={enableGridY}
                pointSize={enablePoints ? 6 : 0}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                useMesh={true}
            />
        </ChartContainer>
    );
};

interface PieChartProps {
    data: any[];
    height?: number;
    className?: string;
    colors?: string[];
    margin?: { top: number; right: number; bottom: number; left: number };
    innerRadius?: number;
    padAngle?: number;
    cornerRadius?: number;
    enableArcLabels?: boolean;
    enableArcLinkLabels?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
    data,
    height = 300,
    className = '',
    colors = defaultColors,
    margin = { top: 40, right: 80, bottom: 80, left: 80 },
    innerRadius = 0.5,
    padAngle = 0.7,
    cornerRadius = 3,
    enableArcLabels = true,
    enableArcLinkLabels = true,
}) => {
    return (
        <ChartContainer height={height} className={className}>
            <ResponsivePie
                data={data}
                margin={margin}
                innerRadius={innerRadius}
                padAngle={padAngle}
                cornerRadius={cornerRadius}
                activeOuterRadiusOffset={8}
                colors={colors}
                theme={chartTheme}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [['darker', 0.2]],
                }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#6B7280"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{
                    from: 'color',
                    modifiers: [['darker', 2]],
                }}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                enableArcLabels={enableArcLabels}
                enableArcLinkLabels={enableArcLinkLabels}
            />
        </ChartContainer>
    );
};

// Export chart theme for custom charts
export { chartTheme, defaultColors };
