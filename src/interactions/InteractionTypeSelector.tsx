import React from 'react';
import { SelectInput, useGetList } from 'react-admin';
import { Box, Typography, Avatar, Stack } from '../components/ui-kit';
import {
    EnvelopeIcon,
    PhoneIcon,
    UserIcon,
    PresentationChartBarIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

const interactionTypeIcons = {
    email: EnvelopeIcon,
    call: PhoneIcon,
    in_person: UserIcon,
    demo: PresentationChartBarIcon,
    quote: CurrencyDollarIcon,
    follow_up: ClockIcon,
};

const interactionTypeColors = {
    email: '#1976d2',
    call: '#388e3c',
    in_person: '#f57c00',
    demo: '#7b1fa2',
    quote: '#d32f2f',
    follow_up: '#455a64',
};

const interactionTypeDescriptions = {
    email: 'Email communication with customer',
    call: 'Phone call with customer',
    in_person: 'Face-to-face meeting or visit',
    demo: 'Product demonstration or sampling',
    quote: 'Price quote or proposal provided',
    follow_up: 'Follow-up contact or reminder',
};

interface InteractionTypeSelectorProps {
    source?: string;
    label?: string;
    required?: boolean;
    size?: 'small' | 'medium';
    variant?: 'outlined' | 'filled' | 'standard';
    fullWidth?: boolean;
    helperText?: string;
}

export const InteractionTypeSelector = ({
    source = 'typeId',
    label = 'Interaction Type',
    required = false,
    size = 'medium',
    variant = 'outlined',
    fullWidth = true,
    helperText = 'Choose the type of interaction',
    ...props
}: InteractionTypeSelectorProps) => {
    // Get interaction types from settings
    const { data: interactionTypes, isLoading } = useGetList('settings', {
        filter: { category: 'interaction_type' },
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'sortOrder', order: 'ASC' },
    });

    const interactionTypeChoices =
        interactionTypes?.map(type => ({
            id: type.id,
            name: type.label,
            key: type.key,
        })) || [];

    const optionRenderer = (choice: any) => {
        if (!choice) return null;

        const Icon =
            interactionTypeIcons[
                choice.key as keyof typeof interactionTypeIcons
            ] || ClockIcon;
        const color =
            interactionTypeColors[
                choice.key as keyof typeof interactionTypeColors
            ] || '#455a64';
        const description =
            interactionTypeDescriptions[
                choice.key as keyof typeof interactionTypeDescriptions
            ] || '';

        return (
            <Stack className="flex-row space-x-1.5 items-center">
                <Avatar
                    className="w-8 h-8"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <Icon className="w-4 h-4" />
                </Avatar>
                <Box>
                    <Typography variant="body2" className="font-medium">
                        {choice.name}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                        {description}
                    </Typography>
                </Box>
            </Stack>
        );
    };

    if (isLoading) {
        return (
            <SelectInput
                source={source}
                label={label}
                choices={[]}
                size={size}
                variant={variant}
                fullWidth={fullWidth}
                helperText="Loading interaction types..."
                disabled
                {...props}
            />
        );
    }

    return (
        <SelectInput
            source={source}
            label={label}
            choices={interactionTypeChoices}
            optionText={optionRenderer}
            validate={required ? [required as any] : undefined}
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            helperText={helperText}
            {...props}
        />
    );
};
