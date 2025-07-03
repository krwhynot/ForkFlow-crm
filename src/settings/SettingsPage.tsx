import { Card, CardContent, CardHeader } from '@mui/material';

export const SettingsPage = () => (
    <Card>
        <CardHeader title="Settings" />
        <CardContent>This is the settings page.</CardContent>
    </Card>
);

SettingsPage.path = '/settings';
