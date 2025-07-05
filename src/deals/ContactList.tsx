import { Stack, Typography } from '../components/ui-kit';
import { useListContext } from 'react-admin';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar } from '../contacts/Avatar';

export const ContactList = () => {
    const { data, error, isPending } = useListContext();
    if (isPending || error) return <div style={{ height: '2em' }} />;
    return (
        <Stack className="flex-row flex-wrap gap-3 mt-1">
            {data.map(contact => (
                <Stack className="flex-row gap-1" key={contact.id}>
                    <Avatar record={contact} />
                    <Stack>
                        <RouterLink
                            to={`/contacts/${contact.id}/show`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                        >
                            {contact.first_name} {contact.last_name}
                        </RouterLink>
                        <Typography variant="caption" className="text-gray-500">
                            {contact.title}
                            {contact.title &&
                                contact.organization?.name &&
                                ' at '}
                            {contact.organization?.name}
                        </Typography>
                    </Stack>
                </Stack>
            ))}
        </Stack>
    );
};
