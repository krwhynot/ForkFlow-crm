import { Card, CardContent, Typography } from '../components/ui-kit';

export const Welcome = () => (
    <Card
        style={{
            background: 'linear-gradient(135deg, #c5dedd 0%, #a8d5d3 100%)',
            color: 'rgba(0, 0, 0, 0.87)',
            border: 'none',
        }}
    >
        <CardContent className="p-6">
            <Typography variant="h5" className="mb-3 font-bold text-gray-800">
                Your CRM Starter Kit
            </Typography>
            <Typography variant="body1" className="mb-3 text-gray-700">
                <strong>ForkFlow CRM</strong> is a template designed to help you quickly build your own CRM.
                This demo runs on a mock API, so you can explore and modify the data. It resets on reload.
                The full version uses Supabase for the backend.
            </Typography>
            <Typography variant="body2" className="text-gray-600">
                Powered by{' '}
                <a
                    href="https://marmelab.com/react-admin"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                    react-admin
                </a>
                , ForkFlow CRM is fully open-source. You can find the code at{' '}
                <a
                    href="https://github.com/marmelab/atomic-crm"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                >
                    marmelab/atomic-crm
                </a>
                .
            </Typography>
        </CardContent>
    </Card>
);
