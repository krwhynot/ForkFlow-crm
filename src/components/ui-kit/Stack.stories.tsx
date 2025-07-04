import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';
import { Box } from './Box';

const meta: Meta<typeof Stack> = {
    title: 'UI Kit/Stack',
    component: Stack,
    tags: ['autodocs'],
    argTypes: {
        direction: {
            control: { type: 'radio' },
            options: ['row', 'col'],
        },
        gap: { control: { type: 'number' } },
        align: {
            control: { type: 'select' },
            options: ['start', 'center', 'end', 'stretch', 'baseline'],
        },
        justify: {
            control: { type: 'select' },
            options: ['start', 'center', 'end', 'between', 'around'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const Items = () => (
    <>
        <Box className="p-4 bg-blue-200 rounded">Item 1</Box>
        <Box className="p-4 bg-green-200 rounded">Item 2</Box>
        <Box className="p-4 bg-yellow-200 rounded">Item 3</Box>
    </>
);

export const Default: Story = {
    args: {
        children: <Items />,
        direction: 'col',
        gap: 2,
    },
};

export const Horizontal: Story = {
    args: {
        children: <Items />,
        direction: 'row',
        gap: 4,
        align: 'center',
        justify: 'between',
        className: 'w-full',
    },
};
