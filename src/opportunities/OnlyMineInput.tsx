import { BooleanInput, useGetIdentity } from 'react-admin';

export const OnlyMineInput = () => {
    const { identity } = useGetIdentity();

    if (!identity) return null;

    return (
        <BooleanInput
            source="createdBy"
            label="Only my opportunities"
            format={value => value === identity.id}
            parse={value => (value ? identity.id : undefined)}
            defaultValue={false}
            helperText="Show only opportunities I created"
        />
    );
};
