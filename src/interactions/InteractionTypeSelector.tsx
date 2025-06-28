import React from 'react';
import { SelectInput, useGetList } from 'react-admin';
import { 
    Box, 
    Typography,
    Avatar,
    Stack,
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    PersonPin as PersonPinIcon,
    Presentation as DemoIcon,
    AttachMoney as QuoteIcon,
    Schedule as FollowUpIcon,
} from '@mui/icons-material';

const interactionTypeIcons = {
    email: EmailIcon,
    call: PhoneIcon,
    in_person: PersonPinIcon,
    demo: DemoIcon,
    quote: QuoteIcon,
    follow_up: FollowUpIcon,
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

    const interactionTypeChoices = interactionTypes?.map(type => ({
        id: type.id,
        name: type.label,
        key: type.key,
    })) || [];

    const optionRenderer = (choice: any) => {
        if (!choice) return null;
        
        const Icon = interactionTypeIcons[choice.key as keyof typeof interactionTypeIcons] || FollowUpIcon;
        const color = interactionTypeColors[choice.key as keyof typeof interactionTypeColors] || '#455a64';
        const description = interactionTypeDescriptions[choice.key as keyof typeof interactionTypeDescriptions] || '';

        return (
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                    sx={{
                        bgcolor: color,
                        width: 32,
                        height: 32,
                    }}
                >
                    <Icon fontSize="small" />
                </Avatar>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {choice.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
            validate={required ? [required] : undefined}
            size={size}
            variant={variant}
            fullWidth={fullWidth}
            helperText={helperText}
            {...props}
        />
    );
};