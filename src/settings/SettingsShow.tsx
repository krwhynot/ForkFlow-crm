import {
    Show,
    TextField,
    BooleanField,
    DateField,
    TopToolbar,
    EditButton,
    DeleteButton,
    useRecordContext,
} from 'react-admin';
import { Box, Card, CardContent, Grid, Typography, Chip } from '@mui/material';
import { Setting } from '../types';

const SettingsShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const ColorDisplay = () => {
    const record = useRecordContext<Setting>();
    
    if (!record?.color) return <span>-</span>;
    
    return (
        <Box display="flex" alignItems="center" gap={1}>
            <Box
                sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: record.color,
                    border: '2px solid #ccc',
                }}
            />
            <Typography variant="body2" fontFamily="monospace">
                {record.color}
            </Typography>
        </Box>
    );
};

const CategoryDisplay = () => {
    const record = useRecordContext<Setting>();
    
    if (!record?.category) return <span>-</span>;
    
    const categoryColors: Record<string, string> = {
        priority: '#9C27B0',
        segment: '#2196F3', 
        distributor: '#FF9800',
        role: '#4CAF50',
        influence: '#F44336',
        decision: '#795548',
    };
    
    return (
        <Chip
            label={record.category}
            sx={{
                backgroundColor: categoryColors[record.category] || '#9E9E9E',
                color: 'white',
                textTransform: 'capitalize',
                fontWeight: 'bold',
            }}
        />
    );
};

export const SettingsShow = () => {
    return (
        <Show actions={<SettingsShowActions />}>
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Setting Details
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Category
                            </Typography>
                            <CategoryDisplay />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Status
                            </Typography>
                            <BooleanField source="active" />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Label
                            </Typography>
                            <TextField source="label" />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Key
                            </Typography>
                            <TextField source="key" />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Color
                            </Typography>
                            <ColorDisplay />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Sort Order
                            </Typography>
                            <TextField source="sortOrder" />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                Audit Information
                            </Typography>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Created At
                            </Typography>
                            <DateField source="createdAt" showTime />
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="textSecondary">
                                Updated At
                            </Typography>
                            <DateField source="updatedAt" showTime />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Show>
    );
};