import React, { useState } from 'react';
import { SpeedDial, SpeedDialAction, Backdrop } from '../components/ui-kit';
import {
    PlusIcon as AddIcon,
    BuildingOfficeIcon as OrganizationIcon,
    UserIcon as ContactIcon,
    DocumentTextIcon as InteractionIcon,
    TrendingUpIcon as OpportunityIcon,
    CalendarIcon as ReminderIcon,
    XMarkIcon as CloseIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export const QuickActionsFAB = () => {
    const isMobile = window.innerWidth < 768; // Tailwind 'md' breakpoint
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    // Only show on mobile and tablet
    if (!isMobile) {
        return null;
    }

    const actions = [
        {
            icon: <InteractionIcon className="h-5 w-5" />,
            name: 'Log Interaction',
            action: () => navigate('/interactions/create'),
            color: '#1976d2', // primary
        },
        {
            icon: <OpportunityIcon className="h-5 w-5" />,
            name: 'New Opportunity',
            action: () => navigate('/opportunities/create'),
            color: '#2e7d32', // success
        },
        {
            icon: <ContactIcon className="h-5 w-5" />,
            name: 'Add Contact',
            action: () => navigate('/contacts/create'),
            color: '#0288d1', // info
        },
        {
            icon: <OrganizationIcon className="h-5 w-5" />,
            name: 'New Organization',
            action: () => navigate('/organizations/create'),
            color: '#7b1fa2', // secondary
        },
        {
            icon: <ReminderIcon className="h-5 w-5" />,
            name: 'Set Reminder',
            action: () => navigate('/reminders/create'),
            color: '#f57c00', // warning
        },
    ];

    const handleAction = (actionFn: () => void) => {
        setOpen(false);
        actionFn();
    };

    return (
        <>
            <Backdrop open={open} onClick={() => setOpen(false)} />
            <SpeedDial
                aria-label="Quick Actions"
                icon={
                    open ? (
                        <CloseIcon className="h-6 w-6" />
                    ) : (
                        <AddIcon className="h-6 w-6" />
                    )
                }
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                direction="up"
            >
                {actions.map(action => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={() => handleAction(action.action)}
                        color={action.color}
                    />
                ))}
            </SpeedDial>
        </>
    );
};
