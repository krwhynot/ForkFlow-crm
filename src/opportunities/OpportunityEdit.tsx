import {
    Edit,
    Form,
    ReferenceInput,
    SelectInput,
    TextInput,
    NumberInput,
    DateInput,
    AutocompleteInput,
    required,
    useRecordContext,
    DeleteButton,
    Toolbar,
    SaveButton,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
} from '@/components/ui-kit';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';
import { FOOD_SERVICE_PIPELINE_STAGES } from './stages';
import { Deal } from '../types';

const OpportunityEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <DeleteButton />
    </Toolbar>
);

export const OpportunityEdit = ({ id }: { id?: string }) => (
    <Edit
        resource="deals"
        id={id}
        transform={(data: any) => ({
            ...data,
            updatedAt: new Date().toISOString(),
        })}
    >
        <OpportunityEditForm />
    </Edit>
);

const OpportunityEditForm = () => {
    const record = useRecordContext<Deal>();

    return (
        <Form>
            <Box maxWidth="lg" sx={{ mx: 'auto', p: 2 }}>
                <Card>
                    <CardContent>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, mb: 3 }}
                        >
                            Edit Opportunity: {record?.name}
                        </Typography>

                        <Grid container spacing={3}>
                            {/* Basic Information */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2 }}
                                >
                                    Opportunity Details
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextInput
                                    source="name"
                                    label="Opportunity Name"
                                    validate={required()}
                                    fullWidth
                                    helperText="Brief description of the sales opportunity"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SelectInput
                                    source="stage"
                                    label="Pipeline Stage"
                                    choices={FOOD_SERVICE_PIPELINE_STAGES.map(
                                        stage => ({
                                            id: stage.id,
                                            name: stage.name,
                                        })
                                    )}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <SelectInput
                                    source="status"
                                    label="Status"
                                    choices={[
                                        { id: 'active', name: 'Active' },
                                        { id: 'won', name: 'Won' },
                                        { id: 'lost', name: 'Lost' },
                                        { id: 'on-hold', name: 'On Hold' },
                                    ]}
                                    fullWidth
                                />
                            </Grid>

                            {/* Organization & Contact */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                                >
                                    Customer Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <ReferenceInput
                                    source="organizationId"
                                    reference="organizations"
                                >
                                    <AutocompleteInput
                                        optionText="name"
                                        label="Organization"
                                        fullWidth
                                        helperText="Select the restaurant or food service business"
                                        validate={required() as any}
                                    />
                                </ReferenceInput>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <ReferenceInput
                                    source="contactId"
                                    reference="contacts"
                                >
                                    <AutocompleteInput
                                        optionText={(choice: any) =>
                                            `${choice.firstName} ${choice.lastName}`
                                        }
                                        label="Primary Contact"
                                        fullWidth
                                        helperText="Key decision maker or influencer"
                                    />
                                </ReferenceInput>
                            </Grid>

                            {/* Product Information */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                                >
                                    Product Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <ReferenceInput
                                    source="productId"
                                    reference="products"
                                >
                                    <AutocompleteInput
                                        optionText="name"
                                        label="Primary Product"
                                        fullWidth
                                        helperText="Main product for this opportunity"
                                    />
                                </ReferenceInput>
                            </Grid>

                            {/* Financial Information */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                                >
                                    Financial Details
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <NumberInput
                                    source="amount"
                                    label="Estimated Value ($)"
                                    validate={required()}
                                    fullWidth
                                    helperText="Expected total deal value"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <DateInput
                                    source="expected_close_date"
                                    label="Expected Close Date"
                                    fullWidth
                                    helperText="When do you expect to close this deal?"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <ProbabilitySlider />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 600, mb: 2, mt: 2 }}
                                >
                                    Additional Information
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextInput
                                    source="description"
                                    label="Description"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    helperText="Detailed description of the opportunity and any special requirements"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextInput
                                    source="notes"
                                    label="Internal Notes"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    helperText="Internal notes and strategy for this opportunity"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Form>
    );
};

const ProbabilitySlider = () => {
    const { setValue, watch } = useFormContext();
    const probability = watch('probability') || 50;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue('probability', parseInt(event.target.value), { shouldDirty: true });
    };

    return (
        <Box className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Probability of Closing: {probability}%
            </label>
            <input
                type="range"
                value={probability}
                onChange={handleChange}
                step={5}
                min={0}
                max={100}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <Box className="flex justify-between text-xs text-gray-600 mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </Box>
        </Box>
    );
};
