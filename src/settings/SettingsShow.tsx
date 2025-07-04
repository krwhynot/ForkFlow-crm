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
import { Box, Chip, Typography } from '../components/ui-kit';
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
        <Box className="flex items-center gap-1">
            <Box
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: record.color }}
            />
            <Typography variant="body2" className="font-mono">
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
            style={{
                backgroundColor: categoryColors[record.category] || '#9E9E9E',
            }}
            className="text-white capitalize font-bold"
        />
    );
};

export const SettingsShow = () => {
    return (
        <Show actions={<SettingsShowActions />}>
            <div className="mt-2">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <Typography variant="h6" className="mb-4">
                                Setting Details
                            </Typography>
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Category
                            </Typography>
                            <CategoryDisplay />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Status
                            </Typography>
                            <BooleanField source="active" />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Label
                            </Typography>
                            <TextField source="label" />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Key
                            </Typography>
                            <TextField source="key" />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Color
                            </Typography>
                            <ColorDisplay />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Sort Order
                            </Typography>
                            <TextField source="sortOrder" />
                        </div>

                        <div className="col-span-2">
                            <Typography variant="h6" className="mb-4 mt-2">
                                Audit Information
                            </Typography>
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Created At
                            </Typography>
                            <DateField source="createdAt" showTime />
                        </div>

                        <div>
                            <Typography
                                variant="subtitle2"
                                className="text-gray-500"
                            >
                                Updated At
                            </Typography>
                            <DateField source="updatedAt" showTime />
                        </div>
                    </div>
                </div>
            </div>
        </Show>
    );
};
