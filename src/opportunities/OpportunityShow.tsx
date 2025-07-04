import * as React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    NumberField,
    DateField,
    ReferenceField,
    useRecordContext,
    TopToolbar,
    EditButton,
    DeleteButton,
} from 'react-admin';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    LinearProgress,
    Grid,
    Stack,
    Divider,
    IconButton,
    Button,
} from '@mui/material';
import {
    Business as BusinessIcon,
    Person as PersonIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    History as HistoryIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LinkedIn as LinkedInIcon,
    Inventory as ProductIcon,
} from '@mui/icons-material';
import { Deal } from '../types';
import { getStageInfo, calculateStageProgress } from './stages';

const OpportunityShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export const OpportunityShow = ({ id }: { id?: string }) => (
    <Show resource="deals" id={id} actions={<OpportunityShowActions />}>
        <OpportunityShowContent />
    </Show>
);

const OpportunityShowContent = () => {
    return (
        <SimpleShowLayout>
            <Grid container spacing={3} sx={{ p: 2 }}>
                {/* Header Section */}
                <Grid item xs={12}>
                    <OpportunityHeader />
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} lg={8}>
                    <Stack spacing={3}>
                        <OpportunityDetails />
                        <InteractionTimeline />
                    </Stack>
                </Grid>

                {/* Sidebar */}
                <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                        <StageProgress />
                        <ContactInfo />
                        <ProductInfo />
                    </Stack>
                </Grid>
            </Grid>
        </SimpleShowLayout>
    );
};

const OpportunityHeader = () => {
    const record = useRecordContext<Deal>();
    if (!record) return null;

    const stageInfo = getStageInfo(record.stage || 'lead_discovery');
    const probability = record.probability || 0;

    return (
        <Card>
            <CardContent>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            <TextField source="name" variant="h4" />
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                            <Chip
                                label={stageInfo?.name || record.stage}
                                sx={{
                                    backgroundColor:
                                        stageInfo?.color || '#e0e0e0',
                                    color: 'text.primary',
                                    fontWeight: 500,
                                }}
                            />
                            <Chip
                                label={`${probability}% Probability`}
                                color={
                                    probability >= 80
                                        ? 'success'
                                        : probability >= 50
                                          ? 'warning'
                                          : 'default'
                                }
                                variant="outlined"
                            />
                            <Chip
                                label={record.status}
                                color={
                                    record.status === 'active'
                                        ? 'primary'
                                        : 'default'
                                }
                            />
                        </Stack>
                        <Typography variant="body1" color="textSecondary">
                            <TextField source="description" />
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Box textAlign={{ xs: 'left', md: 'right' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: {
                                        xs: 'flex-start',
                                        md: 'flex-end',
                                    },
                                }}
                            >
                                <MoneyIcon
                                    sx={{
                                        mr: 1,
                                        color: 'success.main',
                                        fontSize: 32,
                                    }}
                                />
                                <Typography
                                    variant="h3"
                                    color="success.main"
                                    sx={{ fontWeight: 600 }}
                                >
                                    <NumberField
                                        source="amount"
                                        options={{
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }}
                                    />
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mt: 1 }}
                            >
                                Expected close:{' '}
                                <DateField source="expectedClosingDate" />
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const OpportunityDetails = () => {
    const record = useRecordContext<Deal>();

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Opportunity Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                        >
                            Organization
                        </Typography>
                        <ReferenceField
                            source="organizationId"
                            reference="organizations"
                            link="show"
                        >
                            <TextField source="name" />
                        </ReferenceField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                        >
                            Primary Contact
                        </Typography>
                        {record?.contactId ? (
                            <ReferenceField
                                source="contactId"
                                reference="contacts"
                                link="show"
                            >
                                <Typography>
                                    <TextField source="firstName" />{' '}
                                    <TextField source="lastName" />
                                </Typography>
                            </ReferenceField>
                        ) : (
                            <Typography color="textSecondary">
                                No contact assigned
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                        >
                            Created By
                        </Typography>
                        <Typography>
                            <TextField source="createdBy" />
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                        >
                            Created Date
                        </Typography>
                        <DateField source="createdAt" showTime />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography
                            variant="subtitle2"
                            color="textSecondary"
                            gutterBottom
                        >
                            Internal Notes
                        </Typography>
                        <Typography variant="body2">
                            <TextField source="notes" />
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const StageProgress = () => {
    const record = useRecordContext<Deal>();
    if (!record) return null;

    const progress = calculateStageProgress(record.stage || 'lead_discovery');

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Pipeline Progress
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                    >
                        Stage Progress: {Math.round(progress)}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                    >
                        Close Probability: {record.probability || 0}%
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={record.probability || 0}
                        color={
                            (record.probability || 0) >= 80
                                ? 'success'
                                : (record.probability || 0) >= 50
                                  ? 'warning'
                                  : 'primary'
                        }
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>
            </CardContent>
        </Card>
    );
};

const ContactInfo = () => {
    const record = useRecordContext<Deal>();

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {record?.contactId ? (
                    <ReferenceField source="contactId" reference="contacts">
                        <Stack spacing={2}>
                            <Typography variant="h6">
                                <TextField source="firstName" />{' '}
                                <TextField source="lastName" />
                            </Typography>

                            <Stack spacing={1}>
                                <Button
                                    startIcon={<PhoneIcon />}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    <TextField source="phone" />
                                </Button>

                                <Button
                                    startIcon={<EmailIcon />}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    <TextField source="email" />
                                </Button>

                                {record.contact?.linkedInUrl && (
                                    <Button
                                        startIcon={<LinkedInIcon />}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        sx={{ justifyContent: 'flex-start' }}
                                    >
                                        LinkedIn Profile
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </ReferenceField>
                ) : (
                    <Typography color="textSecondary">
                        No contact assigned to this opportunity
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const ProductInfo = () => {
    const record = useRecordContext<Deal>();

    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <ProductIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Product Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {record?.productId ? (
                    <ReferenceField source="productId" reference="products">
                        <Stack spacing={1}>
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 600 }}
                            >
                                <TextField source="name" />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                SKU: <TextField source="sku" />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Category: <TextField source="category" />
                            </Typography>
                        </Stack>
                    </ReferenceField>
                ) : (
                    <Typography color="textSecondary">
                        No product assigned to this opportunity
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

const InteractionTimeline = () => {
    return (
        <Card>
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                >
                    <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                    Interaction Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box
                    sx={{
                        p: 3,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: 'italic' }}
                    >
                        Interaction timeline will be displayed here once the
                        Interactions system is implemented (Task 33). This will
                        show all communications, meetings, and touchpoints
                        related to this opportunity.
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        📞 Calls • 📧 Emails • 🤝 Meetings • 📝 Notes
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};
