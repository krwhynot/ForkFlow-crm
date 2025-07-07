import { useRecordContext } from 'react-admin';
import { Avatar } from '../components/core/Avatar';
import { Company } from '../types';

export const CompanyAvatar = (props: {
    record?: Company;
    width?: number;
    height?: number;
}) => {
    const { width = 40, height = 40 } = props;
    const record = useRecordContext<Company>(props);
    if (!record) return null;
    return (
        <Avatar
            src={record.logo}
            alt={record.name}
            width={width}
            height={height}
        >
            {record.name ? record.name.charAt(0) : '?'}
        </Avatar>
    );
};
