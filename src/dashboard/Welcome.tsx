import { Card, CardContent, Typography } from '../components/ui-kit';

export const Welcome = () => (
    <Card
        style={{
            background: '#c5dedd',
            color: 'rgba(0, 0, 0, 0.87)',
        }}
    >
        <CardContent>
            <Typography variant="h6" className="mb-2">
                Your CRM Starter Kit
            </Typography>
            <Typography variant="body2" className="mb-2">
                <a
                    href="https://marmelab.com/atomic-crm"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    Atomic CRM
                </a>{' '}
                is a template designed to help you quickly build your own CRM.
            </Typography>
            <Typography variant="body2" className="mb-2">
                This demo runs on a mock API, so you can explore and modify the
                data. It resets on reload. The full version uses Supabase for
                the backend.
            </Typography>
            <Typography variant="body2">
                Powered by{' '}
                <a
                    href="https://marmelab.com/react-admin"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    react-admin
                </a>
                , Atomic CRM is fully open-source. You can find the code at{' '}
                <a
                    href="https://github.com/marmelab/atomic-crm"
                    className="text-blue-600 hover:text-blue-800 underline"
                >
                    marmelab/atomic-crm
                </a>
                .
            </Typography>
        </CardContent>
    </Card>
);
