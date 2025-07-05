import { Stack, Typography } from '../components/ui-kit';
import { Divider } from '../components/ui-kit';
import {
    AutocompleteArrayInput,
    AutocompleteInput,
    DateInput,
    NumberInput,
    ReferenceArrayInput,
    ReferenceInput,
    required,
    SelectInput,
    TextInput,
    useCreate,
    useGetIdentity,
    useNotify,
} from 'react-admin';
import { contactInputText, contactOptionText } from '../misc/ContactOption';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

const validateRequired = required();

export const DealInputs = () => {
    const isMobile = useBreakpoint('md');
    return (
        <Stack className="gap-4 p-1">
            <DealInfoInputs />

            <Stack className={`gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <DealLinkedToInputs />
                <Divider
                    orientation={isMobile ? 'horizontal' : 'vertical'}
                    flexItem
                />
                <DealMiscInputs />
            </Stack>
        </Stack>
    );
};

const DealInfoInputs = () => {
    return (
        <Stack className="gap-1 flex-1">
            <TextInput
                source="name"
                label="Deal name"
                validate={validateRequired}
                helperText={false}
            />
            <TextInput
                source="description"
                multiline
                rows={3}
                helperText={false}
            />
        </Stack>
    );
};

const DealLinkedToInputs = () => {
    const [create] = useCreate();
    const notify = useNotify();
    const { identity } = useGetIdentity();

    const handleCreateCompany = async (name?: string) => {
        if (!name) return;
        try {
            const newCompany = await create(
                'companies',
                {
                    data: {
                        name,
                        accountManager: identity?.id,
                        createdAt: new Date().toISOString(),
                    },
                },
                { returnPromise: true }
            );
            return newCompany;
        } catch (error) {
            notify('An error occurred while creating the company', {
                type: 'error',
            });
        }
    };
    return (
        <Stack className="gap-1 flex-1">
            <Typography variant="subtitle1">Linked to</Typography>
            <ReferenceInput source="organizationId" reference="companies">
                <AutocompleteInput
                    optionText="name"
                    onCreate={handleCreateCompany}
                    validate={validateRequired}
                    helperText={false}
                />
            </ReferenceInput>

            <ReferenceArrayInput
                source="contactIds"
                reference="contacts_summary"
            >
                <AutocompleteArrayInput
                    label="Contacts"
                    optionText={contactOptionText}
                    inputText={contactInputText}
                    helperText={false}
                />
            </ReferenceArrayInput>
        </Stack>
    );
};

const DealMiscInputs = () => {
    const { dealStages, dealCategories } = useConfigurationContext();
    return (
        <Stack className="gap-1 flex-1">
            <Typography variant="subtitle1">Misc</Typography>

            <SelectInput
                source="category"
                label="Category"
                choices={dealCategories.map(type => ({
                    id: type,
                    name: type,
                }))}
                helperText={false}
            />
            <NumberInput
                source="amount"
                defaultValue={0}
                validate={validateRequired}
                helperText={false}
            />
            <DateInput
                source="expectedClosingDate"
                fullWidth
                validate={[validateRequired]}
                helperText={false}
                inputProps={{ max: '9999-12-31' }}
                defaultValue={new Date().toISOString().split('T')[0]}
            />
            <SelectInput
                source="stage"
                choices={dealStages.map(stage => ({
                    id: stage.value,
                    name: stage.label,
                }))}
                validate={validateRequired}
                defaultValue="opportunity"
                helperText={false}
            />
        </Stack>
    );
};
