import {
    Box,
    Card,
    CardContent,
    Typography,
} from '../components/ui-kit';
import {
    AutocompleteInput,
    DateInput,
    DeleteButton,
    Edit,
    Form,
    NumberInput,
    ReferenceInput,
    required,
    SaveButton,
    SelectInput,
    TextInput,
    Toolbar,
    useRecordContext,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { FOOD_SERVICE_PIPELINE_STAGES } from './stages';

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
                                    source="expectedClosingDate"
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

    const handleChange = (event: Event, newValue: number | number[]) => {
        setValue('probability', newValue as number, { shouldDirty: true });
    };

    return (
        <FormControl fullWidth>
            <FormLabel component="legend" sx={{ mb: 2 }}>
                Probability of Closing: {probability}%
            </FormLabel>
            <Slider
                value={probability}
                onChange={handleChange}
                valueLabelDisplay="auto"
                step={5}
                marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                ]}
                min={0}
                max={100}
                sx={{
                    '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                    },
                    '& .MuiSlider-track': {
                        height: 6,
                    },
                    '& .MuiSlider-rail': {
                        height: 6,
                    },
                }}
            />
        </FormControl>
    );
};
