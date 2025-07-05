import { PhoneIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { Divider, Link, Stack, Tooltip, Typography } from '@mui/material';
import {
    DateField,
    EditButton,
    ReferenceField,
    SelectField,
    ShowButton,
    TextField,
    UrlField,
    useRecordContext,
} from 'react-admin';

import { Company } from '../types';
import { sizes } from './sizes';

interface CompanyAsideProps {
    link?: string;
}

export const CompanyAside = ({ link = 'edit' }: CompanyAsideProps) => {
    const record = useRecordContext<Company>();
    if (!record) return null;

    return (
        <Stack ml={4} width={250} minWidth={250} spacing={2}>
            <Stack direction="row" spacing={1}>
                {link === 'edit' ? (
                    <EditButton label="Edit Company" />
                ) : (
                    <ShowButton label="Show Company" />
                )}
            </Stack>

            <CompanyInfo record={record} />

            <AddressInfo record={record} />

            <ContextInfo record={record} />

            <AdditionalInfo record={record} />
        </Stack>
    );
};

const CompanyInfo = ({ record }: { record: Company }) => {
    if (!record.website && !record.linkedin_url && !record.phone_number) {
        return null;
    }

    return (
        <Stack>
            <Typography variant="subtitle2">Company Info</Typography>
            <Divider sx={{ mb: 1 }} />
            {record.website && (
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    minHeight={24}
                >
                    <GlobeAltIcon className="w-4 h-4 text-gray-500" />
                    <UrlField
                        source="website"
                        target="_blank"
                        rel="noopener"
                        content={record.website
                            .replace('http://', '')
                            .replace('https://', '')}
                    />
                </Stack>
            )}
            {record.linkedin_url && (
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    minHeight={24}
                >
                    <span className="w-4 h-4 text-gray-500 text-sm font-medium flex items-center">in</span>
                    <Tooltip title={record.linkedin_url}>
                        <Typography
                            variant="body2"
                            component={Link}
                            href={record.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn
                        </Typography>
                    </Tooltip>
                </Stack>
            )}
            {record.phone_number && (
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    minHeight={24}
                >
                    <PhoneIcon color="disabled" fontSize="small" />
                    <TextField source="phone_number" color="textSecondary" />
                </Stack>
            )}
        </Stack>
    );
};

const ContextInfo = ({ record }: { record: Company }) => {
    if (!record.revenue && !record.id) {
        return null;
    }

    return (
        <Stack>
            <Typography variant="subtitle2">Context</Typography>
            <Divider sx={{ mb: 1 }} />
            {record.sector && (
                <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                >
                    Sector: <TextField source="sector" color="textPrimary" />
                </Typography>
            )}
            {record.size && (
                <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                >
                    Size:{' '}
                    <SelectField
                        source="size"
                        color="textPrimary"
                        choices={sizes}
                    />
                </Typography>
            )}
            {record.revenue && (
                <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                >
                    Revenue: <TextField source="revenue" color="textPrimary" />
                </Typography>
            )}
            {record.tax_identifier && (
                <Typography
                    component="span"
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                >
                    Tax Identifier:{' '}
                    <TextField source="tax_identifier" color="textPrimary" />
                </Typography>
            )}
        </Stack>
    );
};

const AddressInfo = ({ record }: { record: Company }) => {
    if (
        !record.address &&
        !record.city &&
        !record.zipcode &&
        !record.stateAbbr
    ) {
        return null;
    }

    return (
        <Stack>
            <Typography variant="subtitle2">Main Address</Typography>
            <Divider sx={{ mb: 1 }} />
            <TextField source="address" color="textSecondary" />
            <TextField source="city" color="textSecondary" />
            <TextField source="zipcode" color="textSecondary" />
            <TextField source="stateAbbr" color="textSecondary" />
            <TextField source="country" color="textSecondary" />
        </Stack>
    );
};

const AdditionalInfo = ({ record }: { record: Company }) => {
    if (
        !record.createdAt &&
        !record.salesId &&
        !record.description &&
        !record.context_links
    ) {
        return null;
    }
    const getBaseURL = (url: string) => {
        try {
            // Check if URL has a protocol, if not prepend https://
            const urlWithProtocol =
                url.startsWith('http://') || url.startsWith('https://')
                    ? url
                    : `https://${url}`;

            const urlObject = new URL(urlWithProtocol);
            return urlObject.origin;
        } catch (error) {
            // Return the original URL if it can't be parsed
            return url;
        }
    };

    return (
        <Stack>
            <Typography variant="subtitle2">Additional Info</Typography>
            <Divider sx={{ mb: 1 }} />
            {record.description && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    {record.description}
                </Typography>
            )}
            {record.context_links && (
                <Stack>
                    {record.context_links
                        .filter(link => link && link.trim() !== '')
                        .map((link, index) => {
                            const urlWithProtocol =
                                link.startsWith('http://') ||
                                link.startsWith('https://')
                                    ? link
                                    : `https://${link}`;

                            return (
                                <Tooltip key={index} title={urlWithProtocol}>
                                    <Typography
                                        variant="body2"
                                        gutterBottom
                                        component={Link}
                                        href={urlWithProtocol}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {getBaseURL(link)}
                                    </Typography>
                                </Tooltip>
                            );
                        })}
                </Stack>
            )}
            {record.salesId !== null && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Followed by{' '}
                    <ReferenceField
                        source="salesId"
                        reference="sales"
                        record={record}
                    />
                </Typography>
            )}
            {record.createdAt && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    Added on{' '}
                    <DateField
                        source="createdAt"
                        record={record}
                        color="textPrimary"
                        options={{
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }}
                    />
                </Typography>
            )}
        </Stack>
    );
};
export default CompanyInfo;
