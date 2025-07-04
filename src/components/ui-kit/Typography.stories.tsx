import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
    title: 'UI Kit/Typography',
    component: Typography,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'body1',
                'body2',
                'caption',
            ],
        },
        className: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
    args: {
        children: 'This is the default body text (body1).',
    },
};

export const AllVariants: Story = {
    render: () => (
        <div className="space-y-4">
            <Typography variant="h1">H1 - The quick brown fox</Typography>
            <Typography variant="h2">H2 - The quick brown fox</Typography>
            <Typography variant="h3">H3 - The quick brown fox</Typography>
            <Typography variant="h4">H4 - The quick brown fox</Typography>
            <Typography variant="h5">H5 - The quick brown fox</Typography>
            <Typography variant="h6">H6 - The quick brown fox</Typography>
            <Typography variant="body1">
                Body1 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
            <Typography variant="body2">
                Body2 - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
            <Typography variant="caption">
                Caption - A small piece of text.
            </Typography>
        </div>
    ),
};

export const CustomComponent: Story = {
    args: {
        variant: 'h1',
        as: 'div',
        children: 'This H1 is rendered as a <div>.',
        className: 'text-purple-600',
    },
};
