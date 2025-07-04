import type { Meta, StoryObj } from '@storybook/react';
import { Box } from './Box';

const meta: Meta<typeof Box> = {
    title: 'UI Kit/Box',
    component: Box,
    tags: ['autodocs'],
    argTypes: {
        className: {
            control: 'text',
            description: 'Tailwind CSS classes',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
    args: {
        children: 'This is a Box component.',
        className: 'p-4 bg-blue-100 border border-blue-300 rounded-lg',
    },
};

export const WithCustomTag: Story = {
    args: {
        as: 'section',
        children: 'This Box is rendered as a <section> element.',
        className: 'p-4 bg-green-100 border border-green-300 rounded-lg',
    },
};
