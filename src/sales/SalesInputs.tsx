import {
    BooleanInput,
    required,
    TextInput,
    useGetIdentity,
    useRecordContext,
} from 'react-admin';
import { Sale } from '../types';
import { Stack } from '../components/ui-kit';

export function SalesInputs() {
    const { identity } = useGetIdentity();
    const record = useRecordContext<Sale>();
    return (
        <Stack className="gap-1 w-full">
            <TextInput
                source="first_name"
                validate={required()}
                helperText={false}
            />
            <TextInput
                source="last_name"
                validate={required()}
                helperText={false}
            />
            <TextInput
                source="email"
                validate={required()}
                helperText={false}
            />
            <BooleanInput
                source="administrator"
                readOnly={record?.id === identity?.id}
                helperText={false}
            />
            <BooleanInput
                source="disabled"
                readOnly={record?.id === identity?.id}
                helperText={false}
            />
        </Stack>
    );
}
