import { Card, CardContent, Typography } from '../components/ui-kit';

export const SettingsPage = () => (
    <Card>
        <CardContent>
            <Typography variant="h5" component="h2" className="mb-4">
                Settings
            </Typography>
            <Typography>This is the settings page.</Typography>
        </CardContent>
    </Card>
);

SettingsPage.path = '/settings';
