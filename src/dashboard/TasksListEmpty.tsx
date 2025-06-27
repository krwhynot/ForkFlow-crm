import { Typography } from '@mui/material';
import { useGetIdentity, useGetList } from 'react-admin';

export const TasksListEmpty = () => {
    const { identity } = useGetIdentity();

    const { total } = useGetList(
        'tasks',
        {
            pagination: { page: 1, perPage: 1 },
            filter: {
                salesId: identity?.id,
            },
        },
        { enabled: !!identity }
    );

    if (total) return null;

    return (
        <Typography variant="body2">
            Tasks added to your contacts will appear here.
        </Typography>
    );
};
