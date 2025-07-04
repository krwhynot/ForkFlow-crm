import { Box } from '../components/ui-kit';
import {
    ArrayInput,
    ReferenceInput,
    SelectInput,
    SimpleFormIterator,
    TextInput,
    required,
    useRecordContext,
} from 'react-admin';
import ImageEditorField from '../misc/ImageEditorField';
import { isLinkedinUrl } from '../misc/isLinkedInUrl';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { Company, Sale } from '../types';
import { sizes } from './sizes';

const isUrl = (url: string) => {
    if (!url) return;
    const UrlRegex = new RegExp(
        /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i
    );
    if (!UrlRegex.test(url)) {
        return 'Must be a valid URL';
    }
};

export const CompanyInputs = () => {
    const isMobile = window.innerWidth < 768; // md breakpoint

    return (
        <Box className="flex flex-col gap-4 p-1">
            <CompanyDisplayInputs />
            <Box className={`flex gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <Box className="flex flex-col gap-4 flex-1">
                    <CompanyContactInputs />
                    <CompanyContextInputs />
                </Box>
                <div
                    className={`${isMobile ? 'border-t' : 'border-l'} border-gray-200`}
                />
                <Box className="flex flex-col gap-4 flex-1">
                    <CompanyAddressInputs />
                    <CompanyAdditionalInformationInputs />
                    <CompanyAccountManagerInput />
                </Box>
            </Box>
        </Box>
    );
};

const CompanyDisplayInputs = () => {
    const record = useRecordContext<Company>();
    return (
        <Box className="flex gap-2 flex-1 flex-row">
            <ImageEditorField
                source="logo"
                type="avatar"
                width={60}
                height={60}
                emptyText={record?.name ? record.name.charAt(0) : ''}
                linkPosition="bottom"
            />
            <TextInput
                source="name"
                validate={required()}
                helperText={false}
                className="mt-0"
            />
        </Box>
    );
};

const CompanyContactInputs = () => {
    return (
        <Box className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Contact</h3>
            <TextInput source="website" helperText={false} validate={isUrl} />
            <TextInput
                source="linkedInUrl"
                helperText={false}
                validate={isLinkedinUrl}
            />
            <TextInput source="phoneNumber" helperText={false} />
        </Box>
    );
};

const CompanyContextInputs = () => {
    const { companySectors } = useConfigurationContext();
    return (
        <Box className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Context</h3>
            <SelectInput
                source="sector"
                choices={companySectors.map(sector => ({
                    id: sector,
                    name: sector,
                }))}
                helperText={false}
            />
            <SelectInput source="size" choices={sizes} helperText={false} />
            <TextInput source="revenue" helperText={false} />
            <TextInput source="taxIdentifier" helperText={false} />
        </Box>
    );
};

const CompanyAddressInputs = () => {
    return (
        <Box className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Address</h3>
            <TextInput source="address" helperText={false} />
            <TextInput source="city" helperText={false} />
            <TextInput source="zipcode" helperText={false} />
            <TextInput source="stateAbbr" helperText={false} />
            <TextInput source="country" helperText={false} />
        </Box>
    );
};

const CompanyAdditionalInformationInputs = () => {
    return (
        <Box className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">
                Additional information
            </h3>
            <TextInput source="description" multiline helperText={false} />
            <ArrayInput source="contextLinks" helperText={false}>
                <SimpleFormIterator
                    disableReordering
                    fullWidth
                    getItemLabel={false}
                    className="m-0"
                >
                    <TextInput
                        source=""
                        hiddenLabel
                        helperText={false}
                        validate={isUrl}
                    />
                </SimpleFormIterator>
            </ArrayInput>
        </Box>
    );
};

const CompanyAccountManagerInput = () => {
    return (
        <Box className="flex flex-col">
            <h3 className="text-lg font-semibold mb-2">Account manager</h3>
            <ReferenceInput
                source="accountManager"
                reference="sales"
                filter={{
                    'disabled@neq': true,
                }}
            >
                <SelectInput
                    label="Account manager"
                    helperText={false}
                    optionText={saleOptionRenderer}
                    validate={required() as any}
                />
            </ReferenceInput>
        </Box>
    );
};

const saleOptionRenderer = (choice: Sale) =>
    `${choice.first_name} ${choice.last_name}`;
