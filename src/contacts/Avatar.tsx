import { useRecordContext } from 'react-admin';
import { Avatar as UIAvatar } from '../components/ui-kit/Avatar';
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
        <UIAvatar
            width={props.width}
            height={props.height}
            title={props.title}
        >
            {record.firstName?.charAt(0).toUpperCase()}
            {record.lastName?.charAt(0).toUpperCase()}
        </UIAvatar>
    );
};
