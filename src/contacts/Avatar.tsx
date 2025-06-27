import { Avatar as MuiAvatar } from '@mui/material';
import { useRecordContext } from 'react-admin';

import { Contact } from '../types';

export const Avatar = (props: {
    record?: Contact;
    width?: number;
    height?: number;
    title?: string;
}) => {
    const record = useRecordContext<Contact>(props);
    // If we come from company page, the record is defined (to pass the company as a prop),
    // but neither of those fields are and this lead to an error when creating contact.
    if (!record?.firstName && !record?.lastName) {
        return null;
    }

    return (
        <MuiAvatar
            src={undefined}
            sx={{
                width: props.width,
                height: props.height,
                fontSize: props.height ? '0.6rem' : undefined,
            }}
            title={props.title}
        >
            {record.firstName?.charAt(0).toUpperCase()}
            {record.lastName?.charAt(0).toUpperCase()}
        </MuiAvatar>
    );
};
