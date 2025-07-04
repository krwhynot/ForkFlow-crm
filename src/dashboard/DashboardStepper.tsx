import { Box } from '../components/Layout/Box';
import { Card } from '../components/Card/Card';
import { CardContent } from '../components/Card/CardContent';
import { Stack } from '../components/Layout/Stack';
import { Typography } from '../components/Typography/Typography';
import { Button } from '../components/Button/Button';
import { LinearProgress } from '../components/Progress/LinearProgress';
import useAppBarHeight from '../misc/useAppBarHeight';
import { CheckCircleIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { CreateButton, Identifier } from 'react-admin';
import { ContactImportButton } from '../contacts/ContactImportButton';
import { Link } from 'react-router-dom';

export const DashboardStepper = ({
    step,
    contactId,
}: {
    step: number;
    contactId?: Identifier;
}) => {
    const appbarHeight = useAppBarHeight();
    return (
        <Stack
            justifyContent="center"
            alignItems="center"
            style={{
                height: `calc(100dvh - ${appbarHeight}px)`,
            }}
        >
            <Card className="w-full max-w-2xl">
                <CardContent>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="between"
                        className="mb-4"
                    >
                        <Typography variant="h6" className="font-bold">
                            What's next?
                        </Typography>
                        <Box className="w-36">
                            <LinearProgress
                                variant="determinate"
                                value={(step / 3) * 100}
                            />
                            <Typography className="text-right">{step}/3 done</Typography>
                        </Box>
                    </Stack>
                    <Stack spacing={6}>
                        <Stack spacing={4} direction="row">
                            <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
                            <Typography className="font-bold">
                                Install Atomic CRM
                            </Typography>
                        </Stack>
                        <Stack spacing={4} direction="row">
                            {step > 1 ? (
                                <CheckCircleIconSolid className="h-5 w-5 text-green-600" />
                            ) : (
                                <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-400" />
                            )}

                            <Stack spacing={2}>
                                <Typography className="font-bold">
                                    Add your first contact
                                </Typography>

                                <Stack spacing={2} direction="row">
                                    <CreateButton
                                        variant="contained"
                                        label="New Contact"
                                        resource="contacts"
                                        size="small"
                                    />
                                    <ContactImportButton />
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack spacing={4} direction="row">
                            <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-400" />
                            <Stack spacing={2}>
                                <Typography className="font-bold">
                                    Add your first note
                                </Typography>
                                <Typography>
                                    Go to a contact page and add a note
                                </Typography>
                                <Button
                                    // @ts-ignore
                                    component={Link}
                                    variant="primary"
                                    size="small"
                                    disabled={step < 2}
                                    className="w-24"
                                    to={`/contacts/${contactId}/show`}
                                >
                                    Add note
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
};
