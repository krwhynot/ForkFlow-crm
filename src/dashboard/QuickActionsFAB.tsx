import React, { useState } from 'react';
import {
    Fab,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
    useTheme,
    useMediaQuery,
    Backdrop,
} from '@mui/material';
import {
    Add as AddIcon,
    Business as OrganizationIcon,
    Person as ContactIcon,
    Assignment as InteractionIcon,
    TrendingUp as OpportunityIcon,
    Schedule as ReminderIcon,
    Phone as PhoneIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const QuickActionsFAB = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    // Only show on mobile and tablet
    if (!isMobile) {
        return null;
    }

    const actions = [
        {
            icon: <InteractionIcon />,
            name: 'Log Interaction',
            action: () => navigate('/interactions/create'),
            color: theme.palette.primary.main,
        },
        {
            icon: <OpportunityIcon />,
            name: 'New Opportunity',
            action: () => navigate('/opportunities/create'),
            color: theme.palette.success.main,
        },
        {
            icon: <ContactIcon />,
            name: 'Add Contact',
            action: () => navigate('/contacts/create'),
            color: theme.palette.info.main,
        },
        {
            icon: <OrganizationIcon />,
            name: 'New Organization',
            action: () => navigate('/organizations/create'),
            color: theme.palette.secondary.main,
        },
        {
            icon: <ReminderIcon />,
            name: 'Set Reminder',
            action: () => navigate('/reminders/create'),
            color: theme.palette.warning.main,
        },
    ];

    const handleAction = (actionFn: () => void) => {
        setOpen(false);
        actionFn();
    };

    return (
        <>
            <Backdrop 
                open={open} 
                sx={{ zIndex: theme.zIndex.speedDial - 1 }}
                onClick={() => setOpen(false)}
            />
            <SpeedDial
                ariaLabel="Quick Actions"
                sx={{
                    position: 'fixed',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                    zIndex: theme.zIndex.speedDial,
                }}
                icon={<SpeedDialIcon openIcon={<CloseIcon />} />}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                direction="up"
                FabProps={{
                    size: 'large',
                    color: 'primary',
                    sx: {
                        boxShadow: theme.shadows[8],
                        '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s ease-in-out',
                        },
                    },
                }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        tooltipOpen
                        onClick={() => handleAction(action.action)}
                        FabProps={{
                            size: 'medium',
                            sx: {
                                bgcolor: action.color,
                                color: 'white',
                                '&:hover': {
                                    bgcolor: action.color,
                                    filter: 'brightness(1.1)',
                                    transform: 'scale(1.05)',
                                },
                                minHeight: 48, // Ensure 44px+ touch targets
                                minWidth: 48,
                            },
                        }}
                        sx={{
                            '.MuiSpeedDialAction-staticTooltipLabel': {
                                minWidth: 'max-content',
                                backgroundColor: theme.palette.grey[800],
                                color: theme.palette.common.white,
                                fontSize: '0.875rem',
                                borderRadius: theme.shape.borderRadius,
                                padding: theme.spacing(0.5, 1),
                                whiteSpace: 'nowrap',
                            },
                        }}
                    />
                ))}
            </SpeedDial>
        </>
    );
};