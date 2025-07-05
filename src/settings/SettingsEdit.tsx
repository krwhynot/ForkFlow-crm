import {
    Edit,
    Form,
    NumberInput,
    SelectInput,
    TextInput,
    BooleanInput,
    Toolbar,
    SaveButton,
    DeleteButton,
    required,
} from 'react-admin';
import { CardContent, Grid } from '@/components/ui-kit';

const SettingsEditToolbar = () => (
    <Toolbar>
        <SaveButton />
        <DeleteButton />
    </Toolbar>
);

export const SettingsEdit = () => {
    return (
        <Edit
            transform={data => ({
                ...data,
                updatedAt: new Date().toISOString(),
            })}
        >
            <Form>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <SelectInput
                                source="category"
                                label="Category"
                                choices={[
                                    { id: 'priority', name: 'Priority' },
                                    { id: 'segment', name: 'Segment' },
                                    { id: 'distributor', name: 'Distributor' },
                                    { id: 'role', name: 'Role' },
                                    { id: 'influence', name: 'Influence' },
                                    { id: 'decision', name: 'Decision' },
                                ]}
                                validate={required()}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="key"
                                label="Key"
                                validate={required()}
                                helperText="Unique identifier (lowercase, underscores)"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="label"
                                label="Label"
                                validate={required()}
                                helperText="Display name"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="color"
                                label="Color"
                                helperText="Hex color code (e.g., #FF5722)"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="sortOrder"
                                label="Sort Order"
                                validate={required()}
                                helperText="Display order (1 = first)"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <BooleanInput
                                source="active"
                                label="Active"
                                helperText="Whether this setting is available for use"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
                <SettingsEditToolbar />
            </Form>
        </Edit>
    );
};
